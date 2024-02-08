import { Component, OnInit, Input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-unit',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  templateUrl: './unit.component.html',
  styleUrl: './unit.component.css'
})
export class UnitComponent {
  @Input() data = {
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

   editurl = "/edit/";
  

  ngOnInit() {
    this.editurl += this.data.unitid.toString();
  }

  // GETTERS AND SETTERS

  setID(newid: number) {
    this.data.unitid = newid;
  }

  getID() {
    return this.data.unitid;    
  }

  setSortorder(neworder: number) {
    this.data.sortorder = neworder;
  }

  getSortorder() {
    return this.data.sortorder;
  }

  setDefault(newdef: boolean) {
    this.data.isdefault = newdef;
  }

  getDefault() {
    return this.data.isdefault;
  }

  // UNIT DATA GETTERS/SETTERS

  setUnitName(newname: string) {
    this.data.unitname = newname;
  }

  getUnitName() {
    return this.data.unitname;
  }

  setRace(newrace: number) {
    if (newrace > 9 || newrace < -1) {
      console.log('error: newrace out of bounds');
      return;
    }
    this.data.race = newrace;
  }

  getRace() {
    return this.data.race;
  }

  setPriClass(newclass: string) {
    this.data.primaryclass = newclass;
  }

  getPriClass() {
    return this.data.primaryclass;
  }

  setSecClass(newclass: string) {
    this.data.secondaryclass = newclass;
  }

  getSecClass() {
    return this.data.secondaryclass;
  }

  setRAbility(newability: string) {
    this.data.rability = newability;
  }
  
  getRAbility() {
    return this.data.rability;
  }

  setPAbility(newability: string) {
    this.data.pability = newability;
  }

  getPAbility() {
    return this.data.pability;
  }

  //END GETTERS/SETTERS

  fetchSprite() {
    //TODO: using race and primaryclass, fetch a sprite to represent the unit
  }

}
