import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { UnitComponent } from './unit/unit.component';
import { PartyService } from './party.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ReactiveFormsModule, CommonModule, A11yModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ffta2-party-builder';

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
    this.pnform.nativeElement.select();
  }

  submitPNForm() {
    this.pnchange = false;
    this.pnameForm.value.pname ?? "Your Party";
    if (!this.pnameForm.value.pname) {
      this.pnameForm.patchValue({pname: "Your Party"})
    }
    this.ps.updatePartyName(this.pnameForm.value.pname!);
  }

}
