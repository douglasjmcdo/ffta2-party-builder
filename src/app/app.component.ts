import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { UnitComponent } from './unit/unit.component';
import { PartyService } from './party.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ffta2-party-builder';
  partyname = "Your Party";

  constructor(private ps: PartyService) {}

  ngOnInit() {
    this.ps.newPartyMember();
  }

}
