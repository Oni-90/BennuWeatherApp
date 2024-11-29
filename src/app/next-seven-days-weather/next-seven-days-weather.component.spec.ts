import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NextSevenDaysWeatherComponent } from './next-seven-days-weather.component';

describe('NextSevenDaysWeatherComponent', () => {
  let component: NextSevenDaysWeatherComponent;
  let fixture: ComponentFixture<NextSevenDaysWeatherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NextSevenDaysWeatherComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NextSevenDaysWeatherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
