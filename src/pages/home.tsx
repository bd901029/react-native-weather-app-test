import React from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  useColorScheme,
} from 'react-native';
import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {fetchWeatherApi} from 'openmeteo';

import {Geolocation} from '../services';
import {Weather} from '../core/models';

const range = (start: number, stop: number, step: number) =>
  Array.from({length: (stop - start) / step}, (_, i) => start + i * step);

type Props = PropsWithChildren<{}>;

export const HomeScreen = ({children}: Props) => {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  const [isLoading, setLoading] = React.useState(false);
  const [currentWeather, setCurrentWeather] = React.useState<Weather | null>(
    null,
  );
  const [dailyWeathers, setDailyWeathers] = React.useState<Array<Weather>>([]);

  React.useEffect(() => {
    getGeolocation();
  }, []);

  async function getGeolocation() {
    const {error, position} = await Geolocation.getLocation();
    if (!position) {
      return;
    }

    const {coords} = position;
    await getWeather(coords.latitude, coords.longitude);
  }

  async function getWeather(lat: number, lon: number) {
    setLoading(true);
    const current = await Weather.fetchCurrentWeather(lat, lon);
    setCurrentWeather(current);

    const daily = await Weather.fetchDaily(lat, lon);
    setDailyWeathers(daily);
    setLoading(false);
  }

  return (
    <View
      style={[
        styles.sectionContainer,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}>
      {isLoading ? (
        <Text
          style={[
            styles.sectionTitle,
            {
              color: isDarkMode ? Colors.black : Colors.black,
            },
          ]}>
          Please wait...
        </Text>
      ) : (
        <></>
      )}
      {currentWeather ? (
        <>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDarkMode ? Colors.black : Colors.black,
              },
            ]}>
            Current Weather
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: isDarkMode ? Colors.black : Colors.black,
              },
            ]}>
            Temp: {currentWeather.temperature2m}, Rainny:{' '}
            {currentWeather.rain ? 'Yes' : 'No'}
          </Text>
        </>
      ) : (
        <></>
      )}
      {dailyWeathers.length > 0 ? (
        <>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDarkMode ? Colors.black : Colors.black,
              },
            ]}>
            Daily Weather
          </Text>
          {dailyWeathers.map((x, i) => (
            <Text
              key={i}
              style={[
                styles.subtitle,
                {
                  color: isDarkMode ? Colors.black : Colors.black,
                },
              ]}>
              {x.time?.toISOString()} : {x.temperature2mMin} -{' '}
              {x.temperature2mMax}
            </Text>
          ))}
        </>
      ) : (
        <></>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: Colors.red,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});
