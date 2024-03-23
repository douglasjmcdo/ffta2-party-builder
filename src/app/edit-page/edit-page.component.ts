import { Component, Input, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { PartyService } from '../party.service';
import { CommonModule } from '@angular/common';
import { Unitdata } from '../unitdata';
import { Subscription } from 'rxjs';
import { SelectSpritePipe } from '../select-sprite.pipe';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { A11yModule } from '@angular/cdk/a11y';
import { trigger, style, animate, transition } from '@angular/animations';

//todo: crit quicken is only available to penelo for viera... does that require any extra logic?


@Component({
  selector: 'app-edit-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, ReactiveFormsModule, SelectSpritePipe, A11yModule],
  templateUrl: './edit-page.component.html',
  styleUrl: './edit-page.component.css',
  animations: [
    trigger(
      'slideInOut', 
      [
        transition(
          ':enter', 
          [
            style({ width: 0 }),
            animate('.3s ease-in-out', style({ width: '!'})),
          ]
        ),
        transition(
          ':leave', 
          [
            animate('.3s ease-in-out', style({ width: 0}))
          ]
        )
      ]
    ),
  ]
})
export class EditPageComponent {
  @Input() routed_id = '-1';

  unit_data: Unitdata = {
    unitid: -1,
    sortorder: -1,

    //this collection is the 'unit data':
    unitname: "Unit",
    race: -1,
    impliedrace: [-1],
    primaryclass: "",
    secondaryclass: "",
    rability: "",
    pability: "",
    changetracker: -1,
  }

  formGroup = new FormGroup({
    race: new FormControl(),
    priclass: new FormControl(),
    secclass: new FormControl(),
    rab: new FormControl(),
    pab: new FormControl()
  });

  @ViewChild('nform') nform!:ElementRef;

  namechange = false;
  nameForm = new FormGroup({
    name: new FormControl("Unit ")
  });

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
      let index = data.findIndex((el) => el.unitid === +this.routed_id);
      this.unit_data = data[index];

      
      //make sure formgroup values are updated to match if necessary
      this.formGroup.patchValue({
        race: this.unit_data.race, 
        priclass: this.unit_data.primaryclass,
        secclass: this.unit_data.secondaryclass,
        rab: this.unit_data.rability,
        pab: this.unit_data.pability
      });
      
      if (this.unit_data.unitname != this.nameForm.value.name) {
        this.nameForm.patchValue({name: this.unit_data.unitname});
      }

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
     else {
      this.priclassfilter = this.filterClassByImpliedRace(true);
    }

    //if secondary class is assigned, remove both agent and secclass from priclass list
    if (this?.unit_data['secondaryclass'] != "") {
      this.removeClassXFromFilter(true, "Agent");
      this.removeClassXFromFilter(true, this?.unit_data['secondaryclass']);
    }

    //hurdy and montblanc cannot be chocobo knights. remove from list
    if (this?.unit_data['secondaryclass'] == "Bard" || 
        this?.unit_data.unitname == "Montblanc" ||
        this?.unit_data.unitname == "Hurdy") {
      this.removeClassXFromFilter(true, "Chocobo Knight");
    }
    this.filterClassByUniquePresents(true);
    
  }

  filterSec() {
    this.secclassfilter = this.ps.CLASSDATA;

    if (this?.unit_data['race'] != -1) {
      this.secclassfilter = this.filterClassByDefinedRace();
    }
    else {
      this.secclassfilter = this.filterClassByImpliedRace(false);
    }

    //if primary class is agent, no secondary classes are available. whoops!
    if (this?.unit_data['primaryclass'] == "Agent") {
      this.secclassfilter = [this.ps.getXClassInfo("")];
    } 
    //if primary class is assigned, remove from secclass pool
    else if (this?.unit_data['primaryclass'] != "") {
      this.removeClassXFromFilter(false, this?.unit_data['primaryclass']);
    }
    
    //hurdy and montblanc cannot be chocobo knights. remove from list
    if (this?.unit_data['primaryclass'] == "Bard" || 
        this?.unit_data.unitname == "Montblanc" ||
        this?.unit_data.unitname == "Hurdy") {
      this.removeClassXFromFilter(false, "Chocobo Knight");
    }

    //agent can never be a secondary class. remove from list
    this.removeClassXFromFilter(false, "Agent");
    this.filterClassByUniquePresents(false);

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
    //optional: add filter for unique classes?
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

  filterClassByUniquePresents(primary: boolean) {
    
    //if this unit is a unique character AND not a unique class, remove all other unique classes 
    let isunique = this.ps.UNIQUECHARS.find((el) => el.name === this?.unit_data.unitname);
    let classisunique = null;
    if (primary) {
      classisunique = this.ps.UNIQUECHARS.find((el) => el.class === this?.unit_data.primaryclass);
    } else {
      classisunique = this.ps.UNIQUECHARS.find((el) => el.class === this?.unit_data.secondaryclass);
    }

    if (isunique && !classisunique) {
      for (let unit of this.ps.UNIQUECHARS) {
        if (unit != isunique && unit.class != "NONE") {
          this.removeClassXFromFilter(primary, unit.class);
        }
      }
      //todo: exception for same class, or no? Hrmm
    } 
    //else, if any unique character classes are already present, 
    //AND this unit is not them, then remove those options from the list
    else {
      let present = this.ps.filterUniquePresentClasses();
      for (let unit of present) {
        if (unit.name != this?.unit_data.unitname && unit.class != "NONE") {
          this.removeClassXFromFilter(primary, unit.class);
        }
      }
    }
  }

  //input: primary bool, class to remove. output: none. splices class x out of indicated filter. if class dne, does nothing
  removeClassXFromFilter(primary: boolean, xclass: string) {
    let ind = this.getIndexOfClassX(primary, xclass);
    if (ind != -1) {
      if (primary) {
        this.priclassfilter.splice(ind, 1);
      } else {
        this.secclassfilter.splice(ind, 1);
      }
    }
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

  //input: primary bool, class to get index of. output: index of classx in given filter
  getIndexOfClassX(primary: boolean, xclass: string) {
    let ind: any;
    if (primary) {
      ind = this.priclassfilter.indexOf(this.ps.getXClassInfo(xclass));
    } else {
      ind = this.secclassfilter.indexOf(this.ps.getXClassInfo(xclass));
    }
    return ind;
  }

  //namechange form controls
  
  //updates unitname AND nameform if nameform is not already aligned
  setUnitName(newname: string) {
    this.ps.updatePartyMember(this.unit_data.unitid, "name", newname);

    //if the update goes through and form no longer matches, realign form to match new name
    if (this.unit_data.unitname != this.nameForm.value.name) {
      this.nameForm.patchValue({name: newname});
    }
  }

  activateNameForm() {
    this.namechange = true;
    this.nform.nativeElement.select();
  }

  submitNameForm() {
    this.namechange = false;
    //check for invalid/empty string and return to default
    if (!this.nameForm.value.name) {
      this.nameForm.patchValue({name: "Unit " + this.unit_data.unitid.toString()})
    }
    //update input data to match form
    this.setUnitName(this.nameForm.value.name!);
  }
  
}

