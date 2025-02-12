import { ChangeDetectorRef, Component, inject, Input, SimpleChanges } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { WeatherData } from '../models/weather-data';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-next-seven-days-weather',
  standalone: true,
  imports: [CommonModule,HttpClientModule,RouterLink, RouterLinkActive],
  providers:[WeatherService],
  templateUrl: './next-seven-days-weather.component.html',
  styleUrl: './next-seven-days-weather.component.css'
})
export class NextSevenDaysWeatherComponent {
  menuOpen = false;
  // @Input() weatherData: WeatherData | null = null;
  @Input() weatherData: WeatherData | null = null;
  locationError: string | null = null;
  

  private weatherService = inject(WeatherService);
  private cdr = inject(ChangeDetectorRef);
  todayWeather: any;

  constructor() {
    this.fetchUserLocationAndWeather();
  }
  
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  getCurrentDate():string{
    const today = new Date();
      const day = today.getDate();
        const month = today.getMonth() + 1; // Months are zero-based
        const year = today.getFullYear();

        return `${day}/${month}/${year}`;
  }

  getHours(date: string): string {
    const today = new Date(date);
    const hours = today.getHours();

    return this.addAmPm(hours);
  }

  addAmPm(hours:number):string{
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strTime = `${hours} ${ampm}`;

    return strTime;
  }

  isCurrentTime(date:string){
      const weatherTime = this.getHours(date)
      const today = new Date();
      const currentHour = today.getHours();
    
    const  hourAmPm= this.addAmPm(currentHour);
    if(weatherTime == hourAmPm){
        return true;
    }
    return false;
  }

  getdayAndMonth():string{
    const today = new Date();
    const day = today.getDay();
    const date = today.getDate();
    const month = today.getMonth() + 1; // Months are zero-based

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return `${days[day]}, ${date} ${months[month]}`;
  }
  

  getProgressBarWidth(temp: number): string {
    const minTemp = -10; // Define the minimum temperature for the range
    const maxTemp = 40;  // Define the maximum temperature for the range
  
    // Ensure the temperature is within the range
    const clampedTemp = Math.max(minTemp, Math.min(maxTemp, temp));
  
    // Calculate the percentage
    const percentage = ((clampedTemp - minTemp) / (maxTemp - minTemp)) * 100;
    return `${percentage}%`;
  }


  fetchUserLocationAndWeather() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.fetchWeatherData(latitude, longitude);
        },
        (error) => {
          this.locationError = "Impossible de récupérer votre position. Veuillez vérifier les paramètres de votre navigateur.";
          console.error('Geolocation error:', error);
        }
      );
    } else {
      this.locationError = "La géolocalisation n'est pas supportée par votre navigateur.";
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['weatherData']) {
      console.log('Received weather data:', this.weatherData);
    }
  }

  async fetchWeatherData(lat: number, lon: number) {
    await this.weatherService.getWeatherData(lat, lon).then(response => {
      const allIntervals = response.data.timelines[0].intervals;
      const today = new Date().toDateString();
  
      // Find today's data
      const todayInterval = allIntervals.find((interval: { startTime: string | number | Date; }) => {
        const intervalDate = new Date(interval.startTime).toDateString();
        return intervalDate === today;
      });

      // Filter out today's data and start from the second day
      const filteredIntervals = allIntervals.filter((interval: { startTime: string | number | Date; }, index: any, self: any[]) => {
        const intervalDate = new Date(interval.startTime).toDateString();
        return intervalDate !== today && self.findIndex(i => new Date(i.startTime).toDateString() === intervalDate) === index;
      });
  
      this.todayWeather = todayInterval;
      this.weatherData = filteredIntervals;
      // console.log(this.weatherData);
    });
  }

}
