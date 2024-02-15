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
  isloaded = false;

  CLASSDATA: any;

  readonly MOCKRABILITY = ["", "Counter", "Magick Counter"];
  readonly MOCKPABILITY = ["", "Shieldbearer", "Item Lore"];
  readonly RACENUMS = [-1, 0, 1, 2, 3, 4, 5, 6];
  readonly RACENAMES = ["Hume", "Bangaa", "Nu Mou", "Viera", "Moogle", "Gria", "Seeq"];


  constructor() { 
    this.partyarraysub.next(this.partyarray);
    this.initializeAPI();
  }

  async initializeAPI() {
    let data = await fetch('/api/read-classdata');
    data.json().then(r => {
      this.CLASSDATA = r.res.rows;
    });
    console.log("API read_classdata called");
    this.isloaded = true;
  }

  //RETURNS THE REQUESTED PARTY MEMBER. RETURNS FIRST PM IF ID IS OOB
  getPartyMemberById(id: number) {
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
      changetracker: 0
    };

    let newid = this.idcount;
    newunit.unitid = newid;
    newunit.sortorder = newid;
    this.idcount++;
    this.partyarray.push(newunit);
    //push updated partyarray to subscribers
    this.partyarraysub.next(this.partyarray);
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
          console.error("name is longer than 16 characters", newvalue);
          break;
        }
        this.partyarray[id].unitname = newvalue;
        this.partyarray[id].changetracker++;
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
        this.partyarray[id].changetracker++;
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
          this.partyarray[id].changetracker++;
        }
        this.partyarray[id].primaryclass = newvalue;
        this.partyarray[id].changetracker++;
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
          console.error("new class is already assigned to priclass", newvalue);
          break;
        }
        this.partyarray[id].secondaryclass = newvalue;
        this.partyarray[id].changetracker++;
        break;
      }

      //rability must exist in predetermined list of rabilities
    case "rability":
      {
        if (!this.MOCKRABILITY.includes(newvalue)) {
          console.error("rability not included in list", newvalue);
          break;
        }
        this.partyarray[id].rability = newvalue;
        this.partyarray[id].changetracker++;
        break;
      }

      //pability must exist in predetermined list of pabilities
    case "pability":
      {
        if (!this.MOCKPABILITY.includes(newvalue)) {
          console.error("pability not included in list", newvalue);
          break;
        }
        this.partyarray[id].pability = newvalue;
        this.partyarray[id].changetracker++;
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
