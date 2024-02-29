import {Expose, Transform, Type, plainToInstance} from 'class-transformer';
import {fetchWeatherApi} from 'openmeteo';

import {Forest} from './forest';
import {Api} from '../../services';

export class Weather {
  @Transform(({value}) => new Date(value)) time!: Date;
  @Transform(({value}) => Math.floor(value)) temperature2m?: number;
  @Transform(({value}) => Math.floor(value)) temperature2mMax?: number;
  @Transform(({value}) => Math.floor(value)) temperature2mMin?: number;
  @Transform(({value}) => value !== 0) rain!: boolean;

  static fromJson(json: any) {
    return plainToInstance(Weather, json);
  }
  static fromJsonArray(arrJson: Array<any>) {
    return arrJson?.map(x => Weather.fromJson(x)) ?? [];
  }

  static async fetchCurrentWeather(lat: number, lon: number) {
    const params = {
      latitude: lat,
      longitude: lon,
      current: ['temperature_2m', 'rain'],
    };
    const url = 'https://api.open-meteo.com/v1/forecast';
    const responses = await fetchWeatherApi(url, params);

    // Process first location. Add a for-loop for multiple locations or weather models
    const response = responses[0];

    // Attributes for timezone and location
    const utcOffsetSeconds = response.utcOffsetSeconds();

    const current = response.current()!;

    const data = {
      time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
      temperature2m: current.variables(0)!.value(),
      rain: current.variables(1)!.value(),
    };
    console.log(data);

    // Note: The order of weather variables in the URL query and the indices below need to match!
    const result = Weather.fromJson(data);
    console.log(result);
    return result;
  }

  static async fetchDaily(lat: number, lon: number) {
    const params = {
      latitude: lat,
      longitude: lon,
      daily: ['temperature_2m_max', 'temperature_2m_min', 'rain_sum'],
    };
    const url = 'https://api.open-meteo.com/v1/forecast';
    const responses = await fetchWeatherApi(url, params);

    // Helper function to form time ranges
    const range = (start: number, stop: number, step: number) =>
      Array.from({length: (stop - start) / step}, (_, i) => start + i * step);

    // Process first location. Add a for-loop for multiple locations or weather models
    const response = responses[0];

    // Attributes for timezone and location
    const utcOffsetSeconds = response.utcOffsetSeconds();
    const timezone = response.timezone();
    const timezoneAbbreviation = response.timezoneAbbreviation();
    const latitude = response.latitude();
    const longitude = response.longitude();

    const hourly = response.hourly()!;
    const daily = response.daily()!;

    // Note: The order of weather variables in the URL query and the indices below need to match!
    const weatherData = {
      daily: {
        time: range(
          Number(daily.time()),
          Number(daily.timeEnd()),
          daily.interval(),
        ).map(t => new Date((t + utcOffsetSeconds) * 1000)),
        temperature2mMax: daily.variables(0)!.valuesArray()!,
        temperature2mMin: daily.variables(1)!.valuesArray()!,
        rainSum: daily.variables(2)!.valuesArray()!,
      },
    };

    // `weatherData` now contains a simple structure with arrays for datetime and weather data
    const results: Array<Weather> = [];
    for (let i = 0; i < weatherData.daily.time.length; i++) {
      results.push(
        Weather.fromJson({
          time: weatherData.daily.time[i].toISOString(),
          temperature2mMax: weatherData.daily.temperature2mMax[i],
          temperature2mMin: weatherData.daily.temperature2mMin[i],
          rain: weatherData.daily.rainSum[i],
        }),
      );
    }
    return results.slice(1, 4);
  }
}
