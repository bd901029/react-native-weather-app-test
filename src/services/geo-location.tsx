import {PermissionsAndroid} from 'react-native';
import RNGeolocation from 'react-native-geolocation-service';

export class Geolocation {
  private static async requestPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Geolocation Permission',
          message: 'Can we access your location?',
          buttonNeutral: 'Ask me later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === 'granted';
    } catch (error) {
      console.log({error});
    }
  }

  static async getLocation(): Promise<{
    error?: RNGeolocation.GeoError;
    position?: RNGeolocation.GeoPosition;
  }> {
    const result = await this.requestPermission();
    if (!result) {
      console.log('Geolocation permission not granted');
      return {};
    }

    return new Promise((resolve, reject) => {
      RNGeolocation.getCurrentPosition(
        position => {
          console.log({position});
          resolve({position, error: undefined});
        },
        error => {
          resolve({error, position: undefined});
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    });
  }
}
