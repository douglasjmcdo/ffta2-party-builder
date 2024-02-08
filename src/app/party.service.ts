import { Injectable } from '@angular/core';
import { Unitdata } from './unitdata';

@Injectable({
  providedIn: 'root'
})
export class PartyService {

  partyarray: Unitdata[] = [];
  private idcount: number = 0;

  readonly MOCKCLASS = ["", "Soldier", "Fighter", "Master Monk", "Thief", "Black Mage", "White Mage", "Ninja", "Seer", "Parivir", "Paladin", "Blue Mage", "Illusionist", "Archer", "Hunter"]
  readonly MOCKRABILITY = ["", "Counter", "Magick Counter"];
  readonly MOCKPABILITY = ["", "Shieldbearer", "Item Lore"];
  readonly DEFAULTUNIT: Unitdata = {
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

  constructor() { }

  //RETURNS THE REQUESTED PARTY MEMBER. RETURNS FIRST PM IF ID IS OOB
  getPartyMemberById(id: number) {
    console.log(id, this.partyarray.length);
    let correctunit = this.partyarray.find((el) => el.unitid === id);
    if (correctunit == undefined) {
      console.error("member of id ", id, "DNE");
      return undefined;
    }
    return correctunit;
  }

  //CREATES A NEW PARTY MEMBER. RETURNS THEIR ID. returns -1 if length > 24
  newPartyMember() {
    if (this.partyarray.length >= 24) {
      console.error("at max party capacity: 24 units");
      return -1;
    }
    let newunit: Unitdata = {
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
    };
    let newid = this.idcount;
    newunit.unitid = newid;
    newunit.sortorder = newid;
    this.idcount++;
    this.partyarray.push(newunit);
    console.log("setting new party member #", this.partyarray[this.partyarray.length-1].unitid);
    return newid;
  }

  //UPDATES DATA OF ID'D PARTY MEMBER
  updatePartyMember (id: number, vartochange: string, newvalue: string) {
    //update partymember's variables. 
    //question: should here or inside the setters be responsible for typechecking?
    switch(vartochange) {

      //names must be strings; must cap at 16 characters
    case "name":
      {
        if (newvalue.length > 16) {
          console.log("name is longer than 16 characters", newvalue);
          break;
        }
        this.partyarray[id].unitname = newvalue;
        break;
      };

      //race must be an int between -1 and 6
    case "race":
      {
        let numval: number = +newvalue;
        if (numval > 6 || numval <  -1) {
          console.error('race number is out of bounds -1 to 6', numval)
          break;
        }
        this.partyarray[id].race = numval;
        break;
      }
      
      //priclass must exist in predetermined list of classes
      //if new priclass matches secclass, set to pri and clear secclass
    case "priclass":
      {
        if (!this.MOCKCLASS.includes(newvalue)) {
          console.error("priclass not included in list", newvalue);
          break;
        }
        if (this.partyarray[id].secondaryclass== newvalue) {
          this.partyarray[id].secondaryclass = "";
        }
        this.partyarray[id].primaryclass = newvalue;
        break;
      }

      //secclass must exist in predetermined list of classes
      //if new secclass matches priclass, do nothing UNLESS it's default
    case "secclass":
      {
        if (!this.MOCKCLASS.includes(newvalue)) {
          console.error("secclass not included in list", newvalue);
          break;
        }
        if (this.partyarray[id].primaryclass == newvalue && newvalue != "") {
          console.log("new class is already assigned to priclass", newvalue);
          break;
        }
        this.partyarray[id].secondaryclass = newvalue;
        break;
      }

      //rability must exist in predetermined list of rabilities
    case "rability":
      {
        if (!this.MOCKRABILITY.includes(newvalue)) {
          console.log("rability not included in list", newvalue);
          break;
        }
        this.partyarray[id].rability = newvalue;
        break;
      }

      //pability must exist in predetermined list of pabilities
    case "pability":
      {
        if (!this.MOCKPABILITY.includes(newvalue)) {
          console.log("pability not included in list", newvalue);
          break;
        }
        this.partyarray[id].pability = newvalue;
        break;
      }
      
    }

  }

  //DELETED ID'D PARTY MEMBER. THEIR ID NUMBER REMAINS UNUSED HEREAFTER
  deletePartyMember(id: number) {
    let index = this.partyarray.findIndex((el) => el.unitid === id);
    if (index != -1) {
      this.partyarray.splice(index, 1);
    }
  }


}
