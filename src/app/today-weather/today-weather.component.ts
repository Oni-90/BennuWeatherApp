import { Chart, registerables } from 'chart.js';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, ChangeDetectorRef, Input, OnChanges, SimpleChanges, Inject, PLATFORM_ID } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { WeatherData } from '../models/weather-data';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-today-weather',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterLink, RouterLinkActive],
  providers: [WeatherService],
  templateUrl: './today-weather.component.html',
  styleUrl: './today-weather.component.css'
})
export class TodayWeatherComponent implements OnChanges {
  menuOpen = false;
  @Input() weatherData: WeatherData | null = null;
  locationError: string | null = null;
  currentTemperature: number | null = null;
  currentCity: string | null = null;

  private weatherService = inject(WeatherService);
  private cdr = inject(ChangeDetectorRef);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.fetchUserLocationAndWeather();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  getCurrentDate(): string {
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

  addAmPm(hours: number): string {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strTime = `${hours} ${ampm}`;
    return strTime;
  }

  isCurrentTime(date: string) {
    const weatherTime = this.getHours(date);
    const today = new Date();
    const currentHour = today.getHours();
    const hourAmPm = this.addAmPm(currentHour);
    return weatherTime === hourAmPm;
  }

  getdayAndMonth(): string {
    const today = new Date();
    const day = today.getDay();
    const date = today.getDate();
    const month = today.getMonth() + 1; // Months are zero-based
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[day]}, ${date} ${months[month]}`;
  }

  fetchUserLocationAndWeather() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.fetchWeatherData(latitude, longitude);
          this.fetchCityName(latitude, longitude);
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
      const todayIntervals = response.data.timelines[0].intervals.filter(
        (fil: any) => {
          const date = new Date(fil.startTime).getDate();
          const today = new Date().getDate();
          return date === today;
        }
      );
  
      if (todayIntervals.length > 0) {
        this.weatherData = todayIntervals;
        // Assuming the temperature is available in the first interval of today's data
        this.currentTemperature = todayIntervals[0].values.temperature;
      }
  
      return this.weatherData;
    });
     // Fetch city name using reverse geocoding
    await this.fetchCityName(lat, lon);
  }


  async fetchCityName(lat: number, lon: number) {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    const data = await response.json();
    this.currentCity = data.address.city || data.address.town || data.address.village || 'Unknown location';
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      Chart.register(...registerables); // register necessary component
  
      const ctx = (document.getElementById('rainChart') as HTMLCanvasElement).getContext('2d');
  
      const rainChart = new Chart(ctx!, {
        type: 'bar', // chart bar
        data: {
          labels: ['10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'], // hours labels
          datasets: [
            {
              label: 'Chance of Rain (%)',
              data: [8, 20, 25, 15, 19, 21], //rain data
              backgroundColor: [
                '#aac2df', // gray
                '#aac2df',
                '#aac2df',
                '#ffeb3b', // yellow
                '#aac2df',
                '#aac2df'
              ],
              borderRadius: 10, // apply border radius
              barPercentage: 0.5 // apply bar percentage
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true, //hide the legend
              labels: {
                color: '#fff' //change the color of the legend
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#fff' //change the color of the ticks
              },
              grid: {
                display: false // hide the grid
              }
            },
            y: {
              ticks: {
                color: '#fff' //change the color of the ticks
              },
              beginAtZero: true, //start at 0
              max: 100, // Maximum 100%
              grid: {
                lineWidth: 1
              }
            }
          }
        }
      });
    }
  }
}