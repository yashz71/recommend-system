import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFlightComponent } from './add-flight-component';

describe('AddFlightComponent', () => {
  let component: AddFlightComponent;
  let fixture: ComponentFixture<AddFlightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFlightComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddFlightComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
