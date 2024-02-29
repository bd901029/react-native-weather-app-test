import axios from 'axios';

import {get, isEmpty, isNil} from 'lodash';

const BASE_URL = 'https://api.openweathermap.org/data/3.0';
const API_KEY = 'b93c701f19b2fee21581121868be298a';

interface ParsedReponseType {
  success?: boolean;
  error?: string | null;
  errorCode?: number | null;
  data?: any;
  [key: string]: any;
}

export class Api {
  static formatError(value: string, errorCode: number) {
    if (isNil(value)) return null;

    let message = value.replace('Error: ', '');
    if (message.includes('jwt malformed')) {
      message = 'Your credentials were not registered in system.';
    }
    if (message.includes('jwt expired') || errorCode === 401) {
      message =
        'The session has expired. Please refresh the page and login to your account to return to the dashboard.';
    }
    if (message.slice(-1) !== '.') {
      return message + '.';
    }
    return message;
  }

  static handleResponse(response: any): ParsedReponseType {
    try {
      if (response.data.error) {
        const {error} = response.data;
        const {code: errorCode, message = '', errors = []} = error || {};
        if (!isNil(message)) {
          return {
            success: false,
            error: Api.formatError(message, errorCode),
            errorCode,
          };
        }

        if (!isEmpty(errors)) {
          const {msg} = errors[0];
          return {
            success: false,
            error: Api.formatError(msg, errorCode),
            errorCode,
          };
        }
      } else if (response.data.errors) {
        const {errors} = response.data;
        const message = get(errors[0], 'message', null);
        const errorCode = get(errors[0], 'extensions.exception.status', 0);
        return {
          error: message,
          errorCode,
        };
      } else {
        return response.data;
      }
    } catch (error) {
      console.log(error);
    }
    return {success: true, data: response.data};
  }

  static parseError(error: any): ParsedReponseType {
    return {
      error: get(error, 'response.errors[0].message', null),
      errorCode: get(
        error,
        'response.errors[0].extensions.response.statusCode',
        null,
      ),
    };
  }

  // static createConfiguration() {
  //   return {...axios.defaults, headers: Api.headers};
  // }

  static async get(path: string, params: any = {}): Promise<ParsedReponseType> {
    let query = '';
    params = {...params, appid: API_KEY};
    if (params) {
      query = '?';
      const keys = Object.keys(params);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        query += `${key}=${encodeURIComponent(params[key])}`;
        if (i < keys.length - 1) {
          query += '&';
        }
      }
    }

    try {
      const requestPath = BASE_URL + path + query;
      console.log(requestPath);
      const response = await axios.get(requestPath);
      return Api.handleResponse(response);
    } catch (error: any) {
      throw error;
    }
  }
}
