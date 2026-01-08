import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecommendFlightComponent } from './recommend-flight-component';

describe('RecommendFlightComponent', () => {
  let component: RecommendFlightComponent;
  let fixture: ComponentFixture<RecommendFlightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecommendFlightComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecommendFlightComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
