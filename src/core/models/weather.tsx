import {Expose, Transform, Type, plainToInstance} from 'class-transformer';

import {Forest} from './forest';

export class Weather {
  lat!: number;
  lon!: number;
  timezone!: string;
  @Transform(({value}) => Forest.fromJson(value)) current?: Forest;
  @Transform(({value}) => value?.map((x: any) => Forest.fromJson(x)) ?? [])
  daily?: Array<Forest>;

  static fromJson(json: any) {
    return plainToInstance(Weather, json, {excludeExtraneousValues: true});
  }
  static fromJsonArray(arrJson: Array<any>) {
    return arrJson?.map(x => Weather.fromJson(x)) ?? [];
  }
}
