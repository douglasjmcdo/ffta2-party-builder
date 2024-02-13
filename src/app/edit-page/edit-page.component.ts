import { Component, Input } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { PartyService } from '../party.service';
import { CommonModule } from '@angular/common';
import { Unitdata } from '../unitdata';
import { Observable, Subscription, of } from 'rxjs';

@Component({
  selector: 'app-edit-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
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
  }
  priclassfilter;
  secclassfilter;
  racefilter;

  public subscriber: Subscription = new Subscription;

  constructor(public ps: PartyService) {
    this.priclassfilter = this.ps.CLASSDATA;
    this.secclassfilter = this.ps.CLASSDATA;
    this.racefilter = this.ps.MOCKRACE;
  }

  ngOnInit() {
    //whenever the service data changes, the subscriber will auto-update unit_data
    this.subscriber = this.ps.partyarraysub$.subscribe(data => {
      this.unit_data = data[+this.routed_id];
      //if any relevant unit data has changed, rerun filters
      this.filterPri();
      this.FilterSec();
      this.FilterRace();
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
    //also remove secclass from priclass pool?
    if (this?.unit_data['secondaryclass'] != "") {
      this.priclassfilter = this.filterClassByImpliedRace(this?.unit_data['secondaryclass']);
    }
  }

  FilterSec() {
    this.secclassfilter = this.ps.CLASSDATA;
    if (this?.unit_data['race'] != -1) {
      this.secclassfilter = this.filterClassByDefinedRace();
    }
    else if (this?.unit_data['primaryclass'] != "") {
      this.secclassfilter = this.filterClassByImpliedRace(this?.unit_data['primaryclass']);
    }
  }

  FilterRace() {
    this.racefilter = this.ps.MOCKRACE;
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

  //utility class
  //input: class. output: array of strings indicating viable races
  givenClassReturnViableRaceList(classname: string) {
    return this.ps.CLASSDATA.find((job: {classname: string; }) =>
      job.classname === classname
    ).viableraces.split(",");
  }


}
