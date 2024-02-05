import { Injectable } from '@angular/core';
import { UnitComponent } from './unit/unit.component';

@Injectable({
  providedIn: 'root'
})
export class PartyService {

  private partyarray: UnitComponent[] = [];
  private idcount: number = 0;

  constructor() { }

  getParty() {
    return this.partyarray;
  }

  getPartyMember(id: number) {
    return this.partyarray[id];
  }

  //CREATES A NEW PARTY MEMBER. RETURNS THEIR ID
  newPartyMember() {
    let newunit = new UnitComponent(); 
    let newid = this.idcount;
    newunit.setID(newid);
    this.idcount++;
    this.partyarray.push(newunit);
    console.log("setting new party member", this.partyarray[this.partyarray.length-1]);
    return newid;
  }

  //UPDATES DATA OF ID'D PARTY MEMBER
  updatePartyMember (id: number, vartochange: string, newvalue: string) {
    //update partymember's variables. 
    //question: should here or inside the setters be responsible for typechecking?
    switch(vartochange) {
    case "name":
      {this.partyarray[id].setUnitName(newvalue);};
      break;
    case "race":
      {this.partyarray[id].setRace(+newvalue);}
      break;
    }
  }

  //DELETED ID'D PARTY MEMBER. THEIR ID NUMBER REMAINS UNUSED HEREAFTER
  deletePartyMember(id: number) {
    //TODO: establish deletion
  }


}
