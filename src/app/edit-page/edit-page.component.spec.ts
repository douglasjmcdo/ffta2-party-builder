import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from "@angular/router/testing";
import { of } from 'rxjs';
import { EditPageComponent } from './edit-page.component';
import { PartyService } from '../party.service';
import { MockPartyService } from '../party.service.mock';
import MockUnitdata from '../unitdata.mock';
describe('EditPageComponent', () => {
  let component: EditPageComponent;
  let fixture: ComponentFixture<EditPageComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [EditPageComponent, RouterTestingModule],
      providers: [
        { provide: PartyService, useValue: MockPartyService }
      ],
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditPageComponent);
    component = fixture.componentInstance;
    component['ps']['partyarraysub$'] = of([MockUnitdata]);
    component.routed_id = "0";
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
