import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from "@angular/router/testing";
import { PartyService } from '../party.service';
import { MainPageComponent } from './main-page.component';
import { MockPartyService } from '../party.service.mock';

fdescribe('MainPageComponent', () => {
  let component: MainPageComponent;
  let fixture: ComponentFixture<MainPageComponent>;
  let mock = new MockPartyService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainPageComponent, RouterTestingModule],
      providers: [
        { provide: PartyService, useValue: MockPartyService }
      ],
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    //mock.initializeAPI();
  });
});
