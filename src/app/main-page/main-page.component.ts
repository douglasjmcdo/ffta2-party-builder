import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { PartyService } from '../party.service';
import { UnitComponent } from '../unit/unit.component';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, KeyValuePipe } from '@angular/common';

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
    for (let unit of this.ps.partyarray) {
      for (const entry of Object.values(unit)) {
        tsv += entry + "  "
      }
      tsv += "\r\n";
    }
    console.log(tsv);
  }

}
