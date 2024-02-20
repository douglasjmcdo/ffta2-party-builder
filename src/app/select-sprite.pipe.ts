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

    //edgecase: entry undefined. will only occur on main page- use unitdata[impliedrace]
    if (entry == undefined) {
      let racenum = unit_data['impliedrace'][1];
      if (racenum == undefined || unit_data['impliedrace'].length >= 7) { racenum = -1 };
      raceinjection = this.ps.getDefaultSpriteForRace(racenum);
      return finalurl + raceinjection + "Sprite.webp";
    }

    //ASSUME ENTRY IS DEFINED
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
          let priclassviableraces = this.ps.getClassViableRaces(unit_data.primaryclass);
          for (let r of priclassviableraces) {
            if (entry['viableraces'].includes(r.toString())) {
              raceinjection = this.ps.RACENAMES[r];
              break;
            }
          }
        }
        if (raceinjection == "" && unit_data.secondaryclass != "") {
          let secclassviableraces = this.ps.getClassViableRaces(unit_data.secondaryclass);
          for (let r of secclassviableraces) {
            if (entry['viableraces'].includes(r.toString())) {
              raceinjection = this.ps.RACENAMES[r];
              break;
            }
          }
        }
        
        //final safeguard: if nothing else works, use first viable race for class
        if (raceinjection == "") {
          raceinjection = this.ps.RACENAMES[+entry['viableraces'][0]];
        }
      }
  
      return finalurl + raceinjection + entry['classname'] + "Sprite.webp";
    }
  }

}