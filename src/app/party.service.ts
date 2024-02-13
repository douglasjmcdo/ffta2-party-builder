import { Injectable } from '@angular/core';
import { Unitdata } from './unitdata';
import { Observable, BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class PartyService {

  partyarray: Unitdata[] = [];
  private partyarraysub = new BehaviorSubject<Unitdata[]>([]);
  partyarraysub$ = this.partyarraysub.asObservable();

  private idcount: number = 0;

  CLASSDATA: any;

  readonly MOCKCLASS = ["", "Soldier", "Fighter", "Master Monk", "Thief", "Black Mage", "White Mage", "Ninja", "Seer", "Parivir", "Paladin", "Blue Mage", "Illusionist", "Archer", "Hunter"]
  readonly MOCKRABILITY = ["", "Counter", "Magick Counter"];
  readonly MOCKPABILITY = ["", "Shieldbearer", "Item Lore"];
  readonly MOCKRACE = [-1, 0, 1, 2, 3, 4, 5, 6];


  constructor() { 
    this.partyarraysub.next(this.partyarray);
    this.initializeAPI();
  }

  async initializeAPI() {
    let data = await fetch('/api/read-classdata');
    data.json().then(r => {
      this.CLASSDATA = r.res.rows;
    });
  }

  //RETURNS THE REQUESTED PARTY MEMBER. RETURNS FIRST PM IF ID IS OOB
  getPartyMemberById(id: number) {
    console.log('test', id, this.partyarray.length);
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
    //push updated partyarray to subscribers
    this.partyarraysub.next(this.partyarray);
    console.log("setting new party member #", this.partyarray[this.partyarray.length-1].unitid);
    return newid;
  }

  //UPDATES DATA OF ID'D PARTY MEMBER
  updatePartyMember (id: number, vartochange: string, newvalue: string) {
    //update partymember's variables.
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
        let job = this.CLASSDATA.find((job: { classname: string; }) => job.classname === newvalue);
        if (!job) {
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
        let job = this.CLASSDATA.find((job: { classname: string; }) => job.classname === newvalue);
        if (!job) {
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

    this.partyarraysub.next(this.partyarray);
    return;
  }

  //DELETED ID'D PARTY MEMBER. THEIR ID NUMBER REMAINS UNUSED HEREAFTER
  deletePartyMember(id: number) {
    let index = this.partyarray.findIndex((el) => el.unitid === id);
    if (index != -1) {
      this.partyarray.splice(index, 1);
    }
    this.partyarraysub.next(this.partyarray);
    return;
  }


}
