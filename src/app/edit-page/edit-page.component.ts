import { Component, Input } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { PartyService } from '../party.service';
import { CommonModule } from '@angular/common';
import { Unitdata } from '../unitdata';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './edit-page.component.html',
  styleUrl: './edit-page.component.css'
})
export class EditPageComponent {
  @Input() routed_id = '-1';

  unit_data: Unitdata = {
    unitid: -1,
    sortorder: -1,
    isdefault: true,

    //this collection is the 'unit data':
    unitname: "default",
    race: -1,
    primaryclass: "",
    secondaryclass: "",
    rability: "",
    pability: "",
  }
  public subscriber: Subscription = new Subscription;

  constructor(public ps: PartyService) {}

  ngOnInit() {
    //whenever the service data changes, the subscriber will auto-update unit_data
    this.subscriber = this.ps.partyarraysub$.subscribe(data => {
      this.unit_data = data[+this.routed_id];
    })
  }


}
