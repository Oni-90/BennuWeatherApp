export interface WeatherInterval {
    startTime: string;
    values: {
      feels_like: number | null;
      sunset(sunset: any): string | null;
      temperature: number;
    };
  }
  
  export interface WeatherData {
    intervals: WeatherInterval[];
  }