import { Component, Input } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { PartyService } from '../party.service';
import { CommonModule } from '@angular/common';
import { Unitdata } from '../unitdata';
import { Observable, Subscription, of } from 'rxjs';
import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  standalone: true,
  name: 'selectSpriteGivenViableRace'
})
export class SelectSpriteGivenViableRacePipe implements PipeTransform {
  transform(ct: number, unit_data: Unitdata, viableraces: string, racenames:string[], racefilter: number[], args?: any): any {
    //if accidentally called when not needed, return empty
    console.log("checking for spam");
    if (viableraces.length <= 1) {
      return "";
    }
    //if a race has been specified, use that one
    if (unit_data.race != -1) {
      return racenames[unit_data.race];
    }
    //if race has been filtered, return first match between viableraces and racefilter
    for (let r of racefilter) {
      if (viableraces.includes(r.toString())) {
        return racenames[r];
      }
    }
    //as a failsafe, use the first in the list
    return racenames[+viableraces[0]];    
  }
}

@Component({
  selector: 'app-edit-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, SelectSpriteGivenViableRacePipe],
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
    primaryclass: "",
    secondaryclass: "",
    rability: "",
    pability: "",
    changetracker: -1,
  }
  priclassfilter;
  secclassfilter;
  racefilter;
  defaultsprites: Array<String> = [];

  public subscriber: Subscription = new Subscription;

  constructor(public ps: PartyService) {
    this.priclassfilter = this.ps.CLASSDATA;
    this.secclassfilter = this.ps.CLASSDATA;
    this.racefilter = this.ps.RACENUMS;
  }

  ngOnInit() {
    //whenever the service data changes, the subscriber will auto-update unit_data
    this.initDefaultRaceSprites();
    this.subscriber = this.ps.partyarraysub$.subscribe(data => {
      this.unit_data = data[+this.routed_id];
      //if any relevant unit data has changed, rerun filters
      this.filterPri();
      this.filterSec();
      this.filterRace();
    })
  }

  //////////////////////////////
  //FILTER HANDLING FUNCTIONS BY VARIABLE
  //////////////////////////////

  filterPri() {
    //reset
    this.priclassfilter = this.ps.CLASSDATA;

    //if the unit has a race, filter on that
    if (this?.unit_data['race'] != -1) {
      this.priclassfilter = this.filterClassByDefinedRace();
    }
    //else, if the unit has secondary class, filter on all viable races for that class
    //optional: also remove secclass from priclass pool?
     else if (this?.unit_data['secondaryclass'] != "") {
      this.priclassfilter = this.filterClassByImpliedRace(this?.unit_data['secondaryclass']);
    }
  }

  filterSec() {
    this.secclassfilter = this.ps.CLASSDATA;
    //todo: always remove AGENT class bc he cant double class lol
    if (this?.unit_data['race'] != -1) {
      this.secclassfilter = this.filterClassByDefinedRace();
    }
    else if (this?.unit_data['primaryclass'] != "") {
      this.secclassfilter = this.filterClassByImpliedRace(this?.unit_data['primaryclass']);
    }
  }

  filterRace() {
    this.racefilter = this.ps.RACENUMS;
    //if the unit has any classes, filter on those.
    //filterRaceByClass is designed to stack so these won't overwrite each other
    if (this?.unit_data['primaryclass']) {
      this.racefilter = this.filterRaceByClass(this?.unit_data['primaryclass']);
    }
    if(this?.unit_data['secondaryclass']) {
      this.racefilter = this.filterRaceByClass(this?.unit_data['secondaryclass']);
    }
  }


  //////////////////////////////
  //SPECIFIC KINDS OF FILTERS
  //////////////////////////////

  filterClassByDefinedRace() {
    return this.ps.CLASSDATA.filter((job: { viableraces: string; }) => 
    job.viableraces.includes(this.unit_data['race'].toString())
    );
  }

  //input: classname. output: class list is filtered by all viable races of that class
  filterClassByImpliedRace(classname: string) {
    //identify viable races by classname
    let viableraces = this.givenClassReturnViableRaceList(classname);

    //filter based on all viable races
    return this.ps.CLASSDATA.filter((job: {viableraces: string; }) => {
      let match = false;
      for (let race of viableraces) {
        if (job.viableraces.includes(race)) {
          match = true;
        }
      }
      return match;
    });
  }

  //input: classname. output: racefilter, filtered further to only viable races
  filterRaceByClass(classname: string) {
    let viableraces = this.givenClassReturnViableRaceList(classname);
    return this.racefilter.filter(r => {
      return viableraces.includes(r.toString())
    });
  }


  //////////////////////////////
  //UTILITY CLASSES
  //////////////////////////////

  //input: class. output: array of strings indicating viable races
  givenClassReturnViableRaceList(classname: string) {
    return this.ps.CLASSDATA.find((job: {classname: string; }) =>
      job.classname === classname
    ).viableraces.split(",");
  }

  //input: race. output: name of class for default sprite
  givenRaceReturnDefaultClassName(race: number) {
    if (race==-1) {return "Null"};
    return this.ps.CLASSDATA?.find((job: {defaultspriteforrace: number}) =>
      job.defaultspriteforrace === race
    ).classname;
  }

  initDefaultRaceSprites() {
    for (let race of this.ps.RACENUMS) {
      this.defaultsprites.push(this.givenRaceReturnDefaultClassName(race));
    }
  }

}

