import { Component, OnInit, Input,  ElementRef, ViewChild } from '@angular/core';
import { PRIMARY_OUTLET, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule  } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Unitdata } from '../unitdata';
import { PartyService } from '../party.service';
import { SelectSpritePipe } from '../select-sprite.pipe';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-unit',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, SelectSpritePipe, ReactiveFormsModule, A11yModule ],
  templateUrl: './unit.component.html',
  styleUrl: './unit.component.css'
})
export class UnitComponent {
  @Input() data: Unitdata = {
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

  @ViewChild('nform') nform!:ElementRef;
  
  namechange = false;
  nameForm = new FormGroup({
    name: new FormControl("Unit ")
  });

  editurl = "/edit/";
  priclassentry: any;
  deletemodal: HTMLDialogElement = document.querySelector("dialog")!;
  
  constructor(public ps: PartyService) {}

  ngOnInit() {
    console.log("INIT");
    this.editurl += this.data.unitid.toString();
    this.priclassentry = this.ps.getXClassInfo(this.data.primaryclass);
    if (this.data.unitname == "Unit") {
      this.setUnitName("Unit " + this.data.unitid.toString());
    }
  }

  // GETTERS AND SETTERS - most of these are unused. should they be removed?

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

  // UNIT DATA GETTERS/SETTERS

  //updates unitname AND nameform if nameform is not already aligned
  setUnitName(newname: string) {
    this.ps.updatePartyMember(this.data.unitid, "name", newname);

    //if the update goes through and form no longer matches, realign form to match new name
    if (this.data.unitname != this.nameForm.value.name) {
      this.nameForm.patchValue({name: newname});
    }
  }

  getUnitName() {
    return this.data.unitname;
  }

  setRace(newrace: number) {
    if (newrace > 9 || newrace < -1) {
      console.error('error: newrace out of bounds');
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

  deleteUnit() {
    this.ps.deletePartyMember(this.getID());
    //this.deletemodal.close();
  }

  //NAME FORM
  activateNameForm() {
    this.namechange = true;
    this.nform.nativeElement.select();
  }

  submitNameForm() {
    this.namechange = false;
    //check for invalid/empty string and return to default
    if (!this.nameForm.value.name) {
      this.nameForm.patchValue({name: "Unit " + this.data.unitid.toString()})
    }
    //update input data to match form
    this.setUnitName(this.nameForm.value.name!);
  }

}
