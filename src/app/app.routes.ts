import { Routes } from '@angular/router';
import { TodayWeatherComponent } from './today-weather/today-weather.component';
import { NextSevenDaysWeatherComponent } from './next-seven-days-weather/next-seven-days-weather.component';

export const routes: Routes = [
    {path:'next-day',component:NextSevenDaysWeatherComponent},
    {path:'',component:TodayWeatherComponent}
];
