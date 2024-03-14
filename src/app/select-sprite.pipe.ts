import { Pipe, PipeTransform } from '@angular/core';
import { Unitdata } from './unitdata';
import { PartyService } from './party.service';

@Pipe({
  name: 'selectSprite',
  standalone: true
})
export class SelectSpritePipe implements PipeTransform {
  constructor(public ps: PartyService) {}
  //INPUTS:
  //ct is unit_data's change tracker, used to trigger the pipe. no other purpose
  //UNIT_DATA is the unit data, used to match implicit/defined race
  //ENTRY is the CLASSDATA object for the class in question, if it exists
  transform(ct: number, unit_data: Unitdata, entry?: { viableraces: string; classname: string}, args?: any): any {
    let finalurl = "../../assets/class_sprites/FFTA2-";
    let raceinjection = "";

    //if entry is undefined, this is a UNIT SPRITE:
    if (entry == undefined) {

      //PART 1: DETERMINE IF UNIQUE CHARACTER OR SPRITE
      let uniqnind = this.ps.UNIQUECHARS.findIndex((el) => el.name == unit_data['unitname']);
      let uniqcind = this.ps.UNIQUECHARS.findIndex((el) => 
      el.class == unit_data['primaryclass'] || el.class == unit_data['secondaryclass']);

      //if named on UNIQUECHARS list, use custom sprite
      if (uniqnind != -1) {
        //handle unique sprite info
        let uniqclass = this.ps.UNIQUECHARS[uniqnind].class;
        if (uniqclass != "NONE") {
          return finalurl + uniqclass + "Sprite.webp";
        } else {
          //todo: get custom sprites; naming scheme should use char name
          return finalurl + this.ps.UNIQUECHARS[uniqnind].name + "Sprite.webp";
        }
      }
      //else if classed OR subclassed as heritor, agent, sky pirate, bard, or dancer, use that sprite
      else if (uniqcind != -1) {
        return finalurl + this.ps.UNIQUECHARS[uniqcind].class + "Sprite.webp";
      } 

      //PART 2: NOT A UNIQUE SPRITE
      else {
        //if race is not defined AND impliedrace >= 1 , use nullsprite
        console.log(unit_data['race'], unit_data['impliedrace'].length)
        if (unit_data['race'] == -1 && unit_data['impliedrace'].length != 2) {
          return finalurl + "NullSprite.webp";
        } 

        //race is either explicitly defined or narrowed to 1 or less!
        else {
          //if a class is defined, determine raceinjection and class
          if (unit_data['primaryclass'] != '') {
            raceinjection = this.getUnitRaceName(unit_data, true);
          } else if (unit_data['secondaryclass'] != '') {
            raceinjection = this.getUnitRaceName(unit_data, false);
          } 
          //...or, lacking any class, use explicitly or implicitly defined race's default sprite
          else if (unit_data['race'] != -1){
            raceinjection = this.ps.getDefaultSpriteForRace(unit_data['race']);
          } else {
            raceinjection = this.ps.getDefaultSpriteForRace(unit_data['impliedrace'][1]);
          }
          return finalurl + raceinjection + "Sprite.webp";
        }
      }
    }

    //if entry is defined, we are on the EDIT PAGE:
    else {
      //edgecase: entry defined but class not assigned. display nullsprite
      if (entry['classname'] == "" ) {
        return finalurl + "NullSprite.webp";
      }
      
      //determine if a race injection is needed
      else if (entry['viableraces'].length <= 1) { 
        //only one possible race: no need for race injection! skip to finalurl construction
        raceinjection = "";
      }
      //else if a race has been specified, use that one
      else if (unit_data.race != -1) {
        raceinjection = this.ps.RACENAMES[unit_data.race];
      }
      //else, return first match between unitviableraces and unit_data['impliedrace']
      else {
        if (unit_data['impliedrace']) {
          for (let r of unit_data['impliedrace']) {
            if (entry['viableraces'].includes(r.toString())) {
              raceinjection = this.ps.RACENAMES[r];
              break;
            }
          }
        }

        //edge case: no matches in unit_data['impliedrace'] or unit_data['impliedrace'] dne. 
        //this can happen on edit_page when one class implies more than the other- 
        //f.ex timemage/blackmage still needs to display archer
        //in these cases, try to find overlap directly with assigned classes
        if (raceinjection == "" && unit_data.primaryclass != "" ) {
          raceinjection = this.noMatches(unit_data, entry, true);
        }
        else if (raceinjection == "" && unit_data.secondaryclass != "") {
          raceinjection = this.noMatches(unit_data, entry, false);
        }
        
        //final safeguard: if nothing else works, use first viable race for class
        if (raceinjection == "") {
          raceinjection = this.ps.RACENAMES[+entry['viableraces'][0]];
        }
      }
  
      return finalurl + raceinjection + entry['classname'] + "Sprite.webp";
    }
  }

  getUnitRaceName(unit_data: any, ispri: boolean) {
    let ri = [];
    let retstring = "";
    let retstringend = unit_data['primaryclass'];
    
    //check how many viableraces exist on the class to confirm if injection is needed
    if (ispri) {
      ri = this.ps.getXClassInfo(unit_data.primaryclass)['viableraces'].length
    } else {
      ri = this.ps.getXClassInfo(unit_data.secondaryclass)['viableraces'].length
      retstringend = unit_data['secondaryclass']; 
    };

    //return the first one (0 being -1)
    if (ri > 2) {
      if (unit_data['race'] != -1) {
        retstring = this.ps.RACENAMES[unit_data['race']];
      } else {
        retstring = this.ps.RACENAMES[unit_data['impliedrace'][1]];
      }
    }
    return retstring + retstringend;
  }

  noMatches(unit_data: any, entry: any, ispri: boolean) {
    let classviableraces = [];
    if (ispri) {
      classviableraces = this.ps.getClassViableRaces(unit_data.primaryclass);
    } else {
      classviableraces = this.ps.getClassViableRaces(unit_data.secondaryclass);
    }
    for (let r of classviableraces) {
      if (entry['viableraces'].includes(r.toString())) {
        return this.ps.RACENAMES[r];
      }
    }
    return "";
  }

}