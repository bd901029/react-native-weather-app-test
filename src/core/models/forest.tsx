import {Expose, Transform, Type, plainToInstance} from 'class-transformer';

export class Temperature {
  day?: number;
  min?: number;
  max?: number;
  night?: number;
  eve?: number;
  morn?: number;

  static fromJson(json: any) {
    return plainToInstance(Temperature, json, {excludeExtraneousValues: true});
  }
  static fromJsonArray(arrJson: Array<any>) {
    return arrJson?.map(x => Temperature.fromJson(x)) ?? [];
  }
}

export class Forest {
  @Expose({name: 'dt'})
  @Transform(({value}) => (value ? new Date(value) : null))
  date?: Date;
  @Transform(({value}) => (value ? new Date(value) : null)) sunrise?: Date;
  @Transform(({value}) => (value ? new Date(value) : null)) sunset?: Date;
  @Transform(({value}) => (value ? new Date(value) : null)) moonrise?: Date;
  @Transform(({value}) => (value ? new Date(value) : null)) moonset?: Date;
  @Transform(({value}) => Temperature.fromJson(value))
  temperature?: Temperature;

  static fromJson(json: any) {
    return plainToInstance(Forest, json, {excludeExtraneousValues: true});
  }
  static fromJsonArray(arrJson: Array<any>) {
    return arrJson?.map(x => Forest.fromJson(x)) ?? [];
  }
}
