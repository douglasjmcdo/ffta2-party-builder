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
  loaderror = false;

  CLASSDATA: Array<any> = [];
  RABILITYDATA: Array<any> = [];
  PABILITYDATA: Array<any> = [];

  readonly RACENUMS = [-1, 0, 1, 2, 3, 4, 5, 6];
  readonly RACENAMES = ["Hume", "Bangaa", "Nu Mou", "Viera", "Moogle", "Gria", "Seeq"];
  defaultsprites: Array<string> = [];

  constructor() { 
    this.partyarraysub.next(this.partyarray);
    this.initializeAPI();
  }

  async initializeAPI() {
    let data = await fetch('/api/read-classdata');
    console.log("COMPARE", data);
    if (data.status == 200) {
      data.json().then(r => {
        console.log("r", r);
        this.CLASSDATA = r.res.rows;
        this.initDefaultRaceSprites();
      });
    } else {
      this.loaderror = true;
    }
    console.log("API read_classdata called");

    data = await fetch('/api/read-abilitydata?Reactive=true');
    if (data.status == 200) {
      data.json().then(r => {
        console.log("r2");

        this.RABILITYDATA = r.res.rows;      
      });
    } else {
      this.loaderror = true;
    }

    data = await fetch('/api/read-abilitydata?Reactive=false');
    if (data.status == 200) {
      data.json().then(r => {
        this.PABILITYDATA = r.res.rows;   
        console.log("r3", r.res.rows, this.PABILITYDATA[0], this.RABILITYDATA[0], this.CLASSDATA[0]);
    
      });
    } else {
      this.loaderror = true;
    }
    this.isloaded = true;
    console.log("API read_abilitydata called", this.isloaded, this.loaderror);
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
      unitname: "Unit",
      race: -1,
      impliedrace: [-1],
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
    let index = this.partyarray.findIndex((el) => el.unitid === id);

    //update partymember's variables.
    switch(vartochange) {

      //names must be strings; must cap at 16 characters
    case "name":
      {
        if (newvalue.length > 16) {
          console.error("name is longer than 16 characters", newvalue);
          break;
        }
        this.partyarray[index].unitname = newvalue;
        this.partyarray[index].changetracker++;
        break;
      };

      //race must be an int between -1 and 6
      //if race is already assigned, then unassign
    case "race":
      {
        console.log("SERVICE:", id, vartochange, newvalue)
        let numval: number = +newvalue;
        if (numval > 6 || numval <  -1) {
          console.error('race number is out of bounds -1 to 6', numval)
          break;
        }
        else if (numval == this.partyarray[index].race) {
          this.partyarray[index].race = -1;
        } 
        else {
          this.partyarray[index].race = numval;
        }
        this.partyarray[index].changetracker++;
        break;
      }

      //this variable is only updated in response to other vars being updated.
      //as such, we end the function and DONT push a subscription to avoid infinite recursion
    case "impliedrace":
      {
        let newnumarray = [];
        for (let i of newvalue.split(',')) {
          newnumarray.push(+i);
        }
        this.partyarray[index].impliedrace = newnumarray;
        return;
      }
      
      //newvalue must exist in predetermined list of classes
      //if priclass already assigned newvalue, unassign
      //if new priclass matches secclass, set to pri and clear secclass
    case "priclass":
      {
        let job = this.CLASSDATA.find((job: { classname: string; }) => job.classname === newvalue);
        if (!job) {
          console.error("priclass not included in list", newvalue);
          break;
        }
        else if (this.partyarray[index].primaryclass == newvalue) {
          this.partyarray[index].primaryclass = "";
        }
        else if (this.partyarray[index].secondaryclass== newvalue) {
          this.partyarray[index].secondaryclass = "";
          this.partyarray[index].primaryclass = newvalue;
        } 
        else {
          this.partyarray[index].primaryclass = newvalue;
        }
        this.partyarray[index].changetracker++;
        break;
      }

      //secclass must exist in predetermined list of classes
      //if secclass already assigned newvalue, unassign
      //if new secclass matches priclass, do nothing UNLESS it's default
    case "secclass":
      {
        let job = this.CLASSDATA.find((job: { classname: string; }) => job.classname === newvalue);
        if (!job) {
          console.error("secclass not included in list", newvalue);
          break;
        }
        else if (this.partyarray[index].secondaryclass == newvalue) {
          this.partyarray[index].secondaryclass = "";
        }
        else if (this.partyarray[index].primaryclass == newvalue && newvalue != "") {
          console.error("new class is already assigned to priclass", newvalue);
          break;
        } else {
          this.partyarray[index].secondaryclass = newvalue;
        }
        this.partyarray[index].changetracker++;
        break;
      }

      //rability must exist in predetermined list of rabilities
      //if already assigned, unassign
    case "rability":
      {
        if (newvalue == "") {
          this.partyarray[index].rability = "";
          break;
        }

        let rab = this.RABILITYDATA.find((ab: {abilityname: string; }) => ab.abilityname === newvalue);
        if (!rab) {
          console.error("rability not included in list", newvalue);
          break;
        } else if (this.partyarray[index].rability == newvalue) {
          this.partyarray[index].rability = "";
        } else {
          this.partyarray[index].rability = newvalue;
        }
        this.partyarray[index].changetracker++;
        break;
      }

      //pability must exist in predetermined list of pabilities
      //if already assigned, unassign
    case "pability":
      {
        if (newvalue == "") {
          this.partyarray[index].pability = "";
          break;
        }

        let pab = this.PABILITYDATA.find((ab: {abilityname: string; }) => ab.abilityname === newvalue);
        if (!pab) {
          console.error("pability not included in list", newvalue);
          break;
        }else if (this.partyarray[index].pability == newvalue) {
          this.partyarray[index].pability = "";
        } else {
          this.partyarray[index].pability = newvalue;
        }
        this.partyarray[index].changetracker++;
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

  /////////////////
  //UTILITY CLASSES -- FOR RETRIEVING SPECIFIC INFORMATION OUT OF DATA ARRAYS
  /////////////////

  //GIVEN CLASSNAME, RETURN ENTRY FROM CLASSDATA
  getXClassInfo(classname: string) {
    return this.CLASSDATA?.find((job: {classname: string;}) => job.classname === classname);
  }

  //GIVEN CLASSNAME, RETURN VIABLE RACES IN AN ARRAY OF STRINGS
  getClassViableRaces(classname: string) {
    let data = this.CLASSDATA?.find((job: {classname: string; }) =>
      job.classname === classname
    )
    if (data) {
      return data.viableraces.split(",");
    }
    return undefined;
  }

  //GIVEN ABILITY AND REACTIVE BOOL, GET VIABLE RACES IN AN ARRAY OF STRINGS
  getAbilityViableRaces(abilityname: string, reactive: boolean) {
    let data = {viableraces: ''};
    if (reactive) {
      data = this.RABILITYDATA?.find((job: {abilityname: string; }) =>
        job.abilityname === abilityname
      )
    } else {
      data = this.PABILITYDATA?.find((job: {abilityname: string; }) =>
        job.abilityname === abilityname
      )
    }
    if (data != undefined && data?.viableraces != '') {
      return data.viableraces.split(",");
    }
    return undefined;
  }

  //GIVEN RACE, GET NAME OF CLASS FOR DEFAULTSPRITE
  getDefaultSpriteForRace(race: number) {
    if (race > 6 || race < -1) {
      return undefined;
    }
    else if (race==-1) {
      return "Null";
    };
    return this.CLASSDATA?.find((job: {defaultspriteforrace: number}) =>
      job.defaultspriteforrace === race
    ).classname;
  }

  
  //initializes names for defaultsprites variable
  initDefaultRaceSprites() {
    for (let race of this.RACENUMS) {
      this.defaultsprites.push(this.getDefaultSpriteForRace(race));
    }
  }

}
