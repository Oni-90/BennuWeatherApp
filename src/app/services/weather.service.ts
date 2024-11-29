import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../env';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = environment.tomorrowApiKey;
  private baseUrl = 'https://api.tomorrow.io/v4/timelines';
  constructor(private http:HttpClient) {}


  getWeatherData(lat: number, lon: number): Promise<any> {
    const fields = 'temperature';
    const url = `${this.baseUrl}?location=${lat},${lon}&fields=${fields}&apikey=${this.apiKey}`;
    return this.http.get(url).toPromise();
  }
}
  

