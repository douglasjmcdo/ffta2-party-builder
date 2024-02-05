import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-unit',
  standalone: true,
  imports: [],
  templateUrl: './unit.component.html',
  styleUrl: './unit.component.css'
})
export class UnitComponent {
  private unitid: number = -1;
  sortorder: number = -1;
  isdefault: Boolean = true;

  //this collection is the 'unit data':
  private unitname: string = "default";
  race: number = -1;
  primaryclass: string = "";
  secondaryclass: string = "";
  rability: string = "";
  pability: string = "";

  ngOnInit() {
    //assign unitid, sortorder here
  }

  setID(newid: number) {
    this.unitid = newid;
  }

  getID() {
    return this.unitid;    
  }

  setUnitName(newname: string) {
    this.unitname = newname;
  }

  getUnitName() {
    return this.unitname;
  }

  setRace(newrace: number) {
    if (newrace > 9 || newrace < -1) {
      console.log('error: newrace out of bounds');
      return;
    }
    this.race = newrace;
  }

  getRace() {
    return this.race;
  }

}
