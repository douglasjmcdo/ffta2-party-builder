import { Injectable } from '@angular/core';
import { Unitdata } from './unitdata';
import { Observable, BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class PartyService {

  partyname = "Your Party";
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
  UNIQUECHARS = [
    {name: "Luso", race: 0, class: "NONE", present: false},
    {name: "Adelle", race: 0, class: "Heritor", present: false},
    {name: "Cid", race: 1, class: "NONE", present: false},
    {name: "Vaan", race: 0, class: "Sky Pirate", present: false},
    {name: "Penelo", race: 3, class: "Dancer", present: false},
    {name: "Al-Cid", race: 0, class: "Agent", present: false},
    {name: "Frimelda", race: 0, class: "NONE", present: false},
    {name: "Hurdy", race: 4, class: "Bard", present: false},
    {name: "Montblanc", race: 4, class: "NONE", present: false},
  ];

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

  updatePartyName(newname: string) {
    this.partyname = newname;
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
        
        //if name is on unique list, then confirm no dupes
        let ind = this.UNIQUECHARS.findIndex((el) => el.name == newvalue);
        if (ind != -1) {
          //confirm no dupes (excluding this pre-existing unit)
          let dupes = this.partyarray.find((unit: {unitname: string; unitid: number }) => 
            unit.unitname == newvalue && unit.unitid != id
          );
          if (dupes) {
            console.error(newvalue, " already exists in your party!");
            //todo: make error popup to inform user?
            return "Error";
          }
          //no duplicates: we are good to create this unique unit! 
          //first, update unit race to match unique character
          if (this.UNIQUECHARS[ind].race != this.partyarray[index].race) {
            this.updatePartyMember(id, "race", this.UNIQUECHARS[ind].race.toString());
          }
          //next, if unit has any classes or abilities that conflict with that race, unassign them
          if (!this.classCanBeRace(this.partyarray[index].primaryclass, this.UNIQUECHARS[ind].race)) {
            this.updatePartyMember(id, "priclass", "");
          }
          if (!this.classCanBeRace(this.partyarray[index].secondaryclass, this.UNIQUECHARS[ind].race)) {
            this.updatePartyMember(id, "secclass", "");
          }

          if (!this.abilityCanBeRace(this.partyarray[index].pability, false, this.UNIQUECHARS[ind].race)) {
            this.updatePartyMember(id, "pability", "");
          }
          if (!this.abilityCanBeRace(this.partyarray[index].rability, true, this.UNIQUECHARS[ind].race)) {
            this.updatePartyMember(id, "rability", "");
          }
          
          this.UNIQUECHARS[ind].present = true;
        }

        let oldind = this.UNIQUECHARS.findIndex((el) => el.name == this.partyarray[index].unitname);
        this.partyarray[index].unitname = newvalue;
        this.partyarray[index].changetracker++;

        //after reassigning, check if we were LEAVING a unique char: if so, mark them as not present
        if (oldind != -1) {
          this.UNIQUECHARS[oldind].present = false;
          //also check if classes or abilities are unique to that char: if so, unassign
          if (this.partyarray[index].primaryclass == this.UNIQUECHARS[oldind].class) {
            this.updatePartyMember(id, "priclass", "");
          }
          if (this.partyarray[index].secondaryclass == this.UNIQUECHARS[oldind].class) {
            this.updatePartyMember(id, "secclass", "");
          }
          //todo: add data about custom abilities to unique chars in order to unassign them!

          //also if new assignment is not unique, AND default race matches the old assignment, then clear default race
          if (ind == -1 && this.partyarray[index].race == this.UNIQUECHARS[oldind].race) {
            this.updatePartyMember(id, "race", "-1");
          }
        }

        break;

      };

      //race must be an int between -1 and 6
      //if race is already assigned, then unassign
    case "race":
      {
        let ind = this.UNIQUECHARS.findIndex((el) => el.name == this.partyarray[index].unitname);

        let numval: number = +newvalue;
        if (numval > 6 || numval <  -1) {
          console.error('race number is out of bounds -1 to 6', numval)
          break;
        }

        if (numval == this.partyarray[index].race) {
          this.partyarray[index].race = -1;
        } 
        else {
          this.partyarray[index].race = numval;
        }
        
        if (ind != -1) {
          //if changing race on a unique character, then reset their name before ending
          this.updatePartyMember(id, "name", "Unit " + id);
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
        let uniqind = this.UNIQUECHARS.findIndex((el) => el.class == newvalue);
        let prevuniq = this.UNIQUECHARS.findIndex((el) => el.class == this.partyarray[index].primaryclass);

        if (!job) {
          console.error("priclass not included in list", newvalue);
          break;
        }
        else if (uniqind != -1) {
          //assigning a unique class: check that it or a named unit doesnt already exist
          let dupes = this.partyarray.find((unit: {unitname: string; primaryclass: string }) => 
            unit.unitname == newvalue && unit.primaryclass != this.UNIQUECHARS[uniqind].class
          );
          if (dupes) {
            console.error(this.UNIQUECHARS[uniqind].name, "already exists in your party!");
            //todo: make error popup to inform user?
            return "Error";
          }

          //if UNassigning a unique character via their unique class, then revert their name
          if (this.partyarray[index].primaryclass == newvalue) {
            console.log("Unassigning unique char via class: clear name")
            this.partyarray[index].primaryclass = "";
            this.updatePartyMember(id, "name", "Unit " + id);
            this.partyarray[index].changetracker++;
            break;
          }
        }

        //normal cases: newvalue is not a unique character class
        if (this.partyarray[index].primaryclass == newvalue) {
          this.partyarray[index].primaryclass = "";
        }
        else if (this.partyarray[index].secondaryclass== newvalue) {
          this.partyarray[index].secondaryclass = "";
          this.partyarray[index].primaryclass = newvalue;
        } 
        else {
          this.partyarray[index].primaryclass = newvalue;
        }

        //edgecase: if previous assignment was al-cid, but is no longer, then wipe his name
        if (prevuniq != -1 &&
          this.UNIQUECHARS[prevuniq].name == "Al-Cid" && 
          prevuniq != uniqind) {
          this.updatePartyMember(id, "name", "Unit " + id);
          this.partyarray[index].changetracker++;
        }

        this.partyarray[index].changetracker++;
        this.updateNameForUniqueClasses(id, newvalue, this.partyarray[index].unitname);
        break;
      }

      //secclass must exist in predetermined list of classes
      //if secclass already assigned newvalue, unassign
      //if new secclass matches priclass, do nothing UNLESS it's default
    case "secclass":
      {
        let job = this.CLASSDATA.find((job: { classname: string; }) => job.classname === newvalue);
        let uniqind = this.UNIQUECHARS.findIndex((el) => el.class == newvalue);

        if (!job) {
          console.error("secclass not included in list", newvalue);
          break;
        }
        else if (uniqind != -1) {
          //assigning a unique class: check that it or a named unit doesnt already exist
          let dupes = this.partyarray.find((unit: {unitname: string; secondaryclass: string }) => 
            unit.unitname == newvalue && unit.secondaryclass != this.UNIQUECHARS[uniqind].class
          );  
          if (dupes) {
            console.error(this.UNIQUECHARS[uniqind].name, "already exists in your party!");
            //todo: make error popup to inform user?
            return "Error";
          }

          //if UNassigning a unique character via their unique class, then revert their name
          let prevuniq = this.UNIQUECHARS.findIndex((el) => el.class == this.partyarray[index].secondaryclass);
          if (prevuniq == uniqind) {
            this.partyarray[index].secondaryclass = "";
            this.updatePartyMember(id, "name", "Unit " + id);
            this.partyarray[index].changetracker++;
            break;
          }
        }
        if (this.partyarray[index].secondaryclass == newvalue) {
          this.partyarray[index].secondaryclass = "";
        }
        else if (this.partyarray[index].primaryclass == newvalue && newvalue != "") {
          console.error("new class is already assigned to priclass", newvalue);
          break;
        } else {
          this.partyarray[index].secondaryclass = newvalue;
        }
        this.partyarray[index].changetracker++;
        this.updateNameForUniqueClasses(id, newvalue, this.partyarray[index].unitname);
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

  //GIVEN CLASSNAME AND RACE, RETURN TRUE IF RACE CAN HAVE THAT CLASS
  classCanBeRace(classname: string, race: number) {
    let vis = this.getClassViableRaces(classname);
    if (vis?.includes(race.toString())) {
      return true;
    }
    return false;
  };


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

  //GIVEN ABILITYNAME AND RACE, RETURN TRUE IF RACE CAN HAVE THAT ABILITY
  abilityCanBeRace(abilityname: string, reactive: boolean, race: number) {
    let vis:any = this.getAbilityViableRaces(abilityname, reactive);
    if (vis?.includes(race.toString())) {
      return true;
    }
    return false;
  };

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

  updateNameForUniqueClasses(id: number, classname: string, currentname: string) {
    let unit = this.getPartyMemberById(id);
    if (!unit) {
      console.error(id, "Unit DNE");
      return;
    }

    //if the classname is on the list of uniquechars, update unit name accordingly
    let char_ind = this.UNIQUECHARS.findIndex((el) => el.class == classname);
    if (char_ind != -1) {
      if (this.UNIQUECHARS[char_ind].name == currentname) {
        console.log("Name is already properly assigned: bail");
        return;
      }
      this.updatePartyMember(id, "name", this.UNIQUECHARS[char_ind].name);
      this.UNIQUECHARS[char_ind].present = true;   
    } 
    //else if unitname IS on the list but class impliedraces != unitrace, reset name 
    else {
      let unit_ind = this.UNIQUECHARS.findIndex((el) => el.name == unit!.unitname);
      if (unit_ind != -1) {
        //unitname IS on the list of unique chars: check if new classname has any overlap at all
        //if no overlap between class and character, remove character name
        let viableraces = this.getClassViableRaces(classname);
        if (!viableraces.includes(this.UNIQUECHARS[unit_ind].race.toString())) {
          this.updatePartyMember(id, "name", "Unit " + unit.unitid);
          this.UNIQUECHARS[unit_ind].present = false;
        }
      }
    }
  }

  filterUniquePresentClasses() {
    return this.UNIQUECHARS.filter((unit: { present: boolean; }) => 
      { return unit.present; }
    );
  }
}
