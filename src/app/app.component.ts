import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { UnitComponent } from './unit/unit.component';
import { PartyService } from './party.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ReactiveFormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ffta2-party-builder';
  partyname = "Your Party";

  pnchange = false;
  pnameForm = new FormGroup({
    pname: new FormControl("Your Party")
  });
  @ViewChild('pnform') pnform!:ElementRef;

  constructor(private ps: PartyService, private router: Router) {}

  ngOnInit() {
    this.router.navigate(['']);
    this.ps.newPartyMember();
  }

  activatePNForm() {
    this.pnchange = true;
    this.pnform.nativeElement.focus();

    console.log("FOCUSED ON ", this.pnform.nativeElement);
    //todo: nativeelement is working. why is the focus not working? :(
  }

  submitPNForm() {
    this.pnchange = false;
    this.pnameForm.value.pname ?? "Your Party";
  }

}
