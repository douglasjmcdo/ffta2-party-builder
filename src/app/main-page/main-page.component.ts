import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { PartyService } from '../party.service';
import { UnitComponent } from '../unit/unit.component';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { Unitdata } from '../unitdata';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, UnitComponent
    //BrowserModule
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent {
  
  constructor(public ps: PartyService) {}

  ngOnInit() {
  }

  addPartyMember() {
    this.ps.newPartyMember();
  }

  downloadParty() {
    let tsv = "";

    //set up header
    for (let key of Object.keys(this.ps.partyarray[0])) {
      if (key != "changetracker") {
        tsv += key + "\t";
      }
    }
    tsv += "\r\n";

    //populate for each unit
    for (let unit of this.ps.partyarray) {
      for (const entry of Object.keys(unit)) {
        if (entry == "changetracker") {}
        //make races human-readable
        else if (entry == "race") {
          tsv += this.ps.RACENAMES[unit[entry]] + "\t";
        }
        else {
        tsv += unit[entry as keyof Unitdata] + "\t";
        }
      }
      tsv += "\r\n";
    }
    var blob = new Blob([tsv], { type: 'text/tsv' });
    const link = document.createElement("a");
    const data = window.URL.createObjectURL(blob);
    link.href = data;
    link.download = this.ps.partyname + "_party.tsv"; // set a name for the file
    link.click();
  }

}
