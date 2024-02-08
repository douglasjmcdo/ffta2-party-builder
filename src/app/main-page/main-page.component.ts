import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { PartyService } from '../party.service';
import { UnitComponent } from '../unit/unit.component';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

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
  partyarray: UnitComponent[] = [];
  
  constructor(public ps: PartyService) {}

  ngOnInit() {
    console.log(this.ps.partyarray)
  }

  testNameChange() {
    if (this.ps.partyarray[0].unitname != "Luso") {
      this.ps.updatePartyMember(0, "name", "Luso");
    } else {
      this.ps.updatePartyMember(0, "name", "Adelle");
    }
  }

  testAddPartyMember() {
    this.ps.newPartyMember();
  }

}
