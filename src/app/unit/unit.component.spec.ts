import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from "@angular/router/testing";

import { UnitComponent } from './unit.component';

xdescribe('UnitComponent', () => {
  let component: UnitComponent;
  let fixture: ComponentFixture<UnitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitComponent, RouterTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
