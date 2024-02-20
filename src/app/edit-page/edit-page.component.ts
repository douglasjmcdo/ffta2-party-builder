import { Component, Input } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { PartyService } from '../party.service';
import { CommonModule } from '@angular/common';
import { Unitdata } from '../unitdata';
import { Observable, Subscription, of } from 'rxjs';
import { SelectSpritePipe } from '../select-sprite.pipe';
//note: crit quicken is only available to penelo for viera... does that require any extra logic?


@Component({
  selector: 'app-edit-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, SelectSpritePipe],
  templateUrl: './edit-page.component.html',
  styleUrl: './edit-page.component.css'
})
export class EditPageComponent {
  @Input() routed_id = '-1';

  unit_data: Unitdata = {
    unitid: -1,
    sortorder: -1,
    isdefault: true,

    //this collection is the 'unit data':
    unitname: "default",
    race: -1,
    impliedrace: [-1],
    primaryclass: "",
    secondaryclass: "",
    rability: "",
    pability: "",
    changetracker: -1,
  }
  priclassfilter;
  secclassfilter;
  racefilter;
  pabfilter;
  rabfilter;

  public subscriber: Subscription = new Subscription;

  constructor(public ps: PartyService) {
    this.priclassfilter = this.ps.CLASSDATA;
    this.secclassfilter = this.ps.CLASSDATA;
    this.racefilter = this.ps.RACENUMS;
    this.pabfilter = this.ps.PABILITYDATA;
    this.rabfilter = this.ps.RABILITYDATA;
  }

  ngOnInit() {
    //whenever the service data changes, the subscriber will auto-update unit_data
    this.subscriber = this.ps.partyarraysub$.subscribe(data => {
      this.unit_data = data[+this.routed_id];
      //if any relevant unit data has changed, rerun filters
      this.filterRace();
      this.filterPri();
      this.filterSec();
      this.filterPability();
      this.filterRability();
    })
  }

  ngOnDestroy() {
    this.subscriber.unsubscribe()
  }

  //////////////////////////////
  //FILTER HANDLING FUNCTIONS BY VARIABLE
  //////////////////////////////

  filterPri() {
    //reset all filters
    this.priclassfilter = this.ps.CLASSDATA;

    //if the unit has a race, filter on that
    if (this?.unit_data['race'] != -1) {
      this.priclassfilter = this.filterClassByDefinedRace();
    }
    //else, filter on any implied races
    //optional: also remove secclass from priclass pool?
     else {
      this.priclassfilter = this.filterClassByImpliedRace(true);
    }
  }

  filterSec() {
    this.secclassfilter = this.ps.CLASSDATA;
    //todo: always remove AGENT class bc he cant double class lol
    if (this?.unit_data['race'] != -1) {
      this.secclassfilter = this.filterClassByDefinedRace();
    }
    else {
      this.secclassfilter = this.filterClassByImpliedRace(false);
    }
  }

  filterRace() {
    this.racefilter = this.ps.RACENUMS;
    //if the unit has any classes, filter on those.
    //filterRaceByClass is designed to stack so these won't overwrite each other
    if (this?.unit_data['primaryclass'] != "") {
      this.racefilter = this.filterRaceByClass(this?.unit_data['primaryclass']);
    }
    if(this?.unit_data['secondaryclass'] != "") {
      this.racefilter = this.filterRaceByClass(this?.unit_data['secondaryclass']);
    }
    if (this?.unit_data['rability'] != "") {
      this.racefilter = this.filterRaceByAbility(this?.unit_data['rability'], true);
    }
    if (this?.unit_data['pability'] != "") {
      this.racefilter = this.filterRaceByAbility(this?.unit_data['pability'], false);
    }
    this.ps.updatePartyMember(+this.routed_id, 'impliedrace', this.racefilter.toString());
  }

  filterPability() {
    this.pabfilter = this.ps.PABILITYDATA;
    //if the unit has a specified race, filter on that
    if (this.unit_data['race'] != -1) {
      this.pabfilter = this.filterAbilityByDefinedRace(false);
    }
    //else, filter on any implied races
    else {
      this.pabfilter = this.filterAbilityByImpliedRace(false);
    }
  } 
  
  filterRability() {
    this.rabfilter = this.ps.RABILITYDATA;
    if (this.unit_data['race'] != -1) {
      this.rabfilter = this.filterAbilityByDefinedRace(true);
    }
    else {
      this.rabfilter = this.filterAbilityByImpliedRace(true);
    }
  }


  //////////////////////////////
  //SPECIFIC KINDS OF FILTERS
  //////////////////////////////

  //output: filters classdata on unit_data['race']
  filterClassByDefinedRace() {
    return this.ps.CLASSDATA.filter((job: { viableraces: string; }) => 
      job.viableraces.includes(this.unit_data['race'].toString())
    );
  }

  //input: primary bool. output: class list is filtered by all implied races from unit_data
  filterClassByImpliedRace(primary: boolean) {
    let viableraces: any;
    if (primary) {
      viableraces = this.getImpliedracesExcludingX('primaryclass');
    } else {
      viableraces = this.getImpliedracesExcludingX('secondaryclass');
    }
    return this.ps.CLASSDATA.filter((job: {viableraces: string; }) => {
      return this.givenRaceListAndEntryReturnTrueIfMatch(viableraces, job.viableraces);
    });
  }

  //input: classname. output: racefilter, filtered further to only viable races
  filterRaceByClass(classname: string) {
    let viableraces = this.ps.getClassViableRaces(classname);
    return this.filterRacelistOnViableraces(this.racefilter, viableraces);
  }

  filterRaceByAbility(abilityname: string, reactive: boolean) {
    let viableraces = this.ps.getAbilityViableRaces(abilityname, reactive);
    return this.filterRacelistOnViableraces(this.racefilter, viableraces);
  }

  //input: reactive bool. output: filters appropriate abilitydata on unit_data['race']
  filterAbilityByDefinedRace(reactive: boolean) {
    if (reactive) {
      return this.ps.RABILITYDATA.filter((ability: {viableraces: string; }) =>
        ability.viableraces.includes(this.unit_data['race'].toString())
      );
    } else {
      return this.ps.PABILITYDATA.filter((ability: {viableraces: string; }) =>
        ability.viableraces.includes(this.unit_data['race'].toString())
      );
    }
  }

  //input: reactive bool. output: ability list is filtered by all implied races from unit_data
  filterAbilityByImpliedRace(reactive: boolean) {
    if (reactive) {
      let viableraces = this.getImpliedracesExcludingX('rability');
      return this.ps.RABILITYDATA.filter((ability: {viableraces: string; }) => {
        return this.givenRaceListAndEntryReturnTrueIfMatch(viableraces, ability.viableraces)
      });
    } else {
      let viableraces = this.getImpliedracesExcludingX('pability');
      return this.ps.PABILITYDATA.filter((ability: {viableraces: string; }) => {
        return this.givenRaceListAndEntryReturnTrueIfMatch(viableraces, ability.viableraces)
      })
    }
  }


  //////////////////////////////
  //UTILITY FUNCTIONS
  //////////////////////////////

  //input: array of allowed races, string to compare to.
  //returns true if any entry in allowedraces exists in filteron string
  givenRaceListAndEntryReturnTrueIfMatch(allowedraces: any[], filteron: string) {
    let match = false;
    for (let race of allowedraces) {
      if (filteron.includes(race.toString())) {
        match = true;
      }
    }
    return match;
  }

  //input: current racelist and a string of viableraces
  //returns: current racelist, filtered down to only include those in viableraces
  filterRacelistOnViableraces(racelist: any[], viableraces: any) {
    return racelist.filter(r => {
      if (r == -1) {
        return true;
      } else {
        return viableraces.includes(r.toString())
      }
    });
  }

  //input: string naming which variable to ignore
  //returns: racelist, filtered on all classes and abilities EXCEPT exception
  //note: if unit_data[race] is assigned, just use it.
  //this doesn't bother filtering on unit_data[race] because this is for implied races only
  getImpliedracesExcludingX(exception: string) {
    let viableraces = this.ps.RACENUMS;
    
    if (this.unit_data['primaryclass'] != "" && exception != 'primaryclass') {
      viableraces = this.filterRacelistOnViableraces(
          viableraces, 
          this.ps.getClassViableRaces(this.unit_data['primaryclass'])
        );
    }
    if (this.unit_data['secondaryclass'] != "" && exception != 'secondaryclass') {
      viableraces = this.filterRacelistOnViableraces(
          viableraces, 
          this.ps.getClassViableRaces(this.unit_data['secondaryclass'])
        );
    }
    if (this.unit_data['rability'] != "" && exception != "rability") {
      viableraces = this.filterRacelistOnViableraces(
        viableraces,
        this.ps.getAbilityViableRaces(this.unit_data['rability'], true)
      );

    }
    if (this.unit_data['pability'] != "" && exception != "pability") {
      viableraces = this.filterRacelistOnViableraces(
        viableraces,
        this.ps.getAbilityViableRaces(this.unit_data['pability'], false)
      );
    }

    return viableraces;
  }

}

