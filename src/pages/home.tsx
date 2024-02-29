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
  TextInput,
  Pressable,
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
  const [lat, setLat] = React.useState<number>();
  const [lon, setLon] = React.useState<number>();
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
    setLat(coords.latitude);
    setLon(coords.longitude);
    await getWeather(coords.latitude, coords.longitude);
  }

  async function getWeather(lat?: number, lon?: number) {
    if (!lat || !lon) return;

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
          backgroundColor: '#F9F8F4',
        },
      ]}>
      <View
        style={{flexDirection: 'row', paddingHorizontal: 10, marginTop: 10}}>
        <TextInput
          style={{flex: 1, borderWidth: 1, padding: 10, borderRadius: 10}}
          keyboardType="number-pad"
          placeholder="Latitude"
          value={`${lat ?? ''}`}
          onChangeText={value => setLat(parseFloat(value))}
        />
        <TextInput
          style={{
            flex: 1,
            marginHorizontal: 10,
            borderWidth: 1,
            padding: 10,
            borderRadius: 10,
          }}
          keyboardType="number-pad"
          placeholder="Longitude"
          value={`${lon ?? ''}`}
          onChangeText={value => setLon(parseFloat(value))}
        />
        <Pressable
          style={{
            backgroundColor: '#E42B76',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 8,
            borderRadius: 8,
          }}
          onPress={() => getWeather(lat, lon)}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDarkMode ? Colors.white : Colors.white,
                textAlign: 'center',
              },
            ]}>
            Search
          </Text>
        </Pressable>
      </View>
      <View style={{paddingHorizontal: 10, marginTop: 10}}>
        {isLoading ? (
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDarkMode ? Colors.black : Colors.black,
                textAlign: 'center',
              },
            ]}>
            Please wait...
          </Text>
        ) : (
          <></>
        )}
        {!isLoading && currentWeather ? (
          <>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: isDarkMode ? Colors.black : Colors.black,
                  textAlign: 'center',
                },
              ]}>
              Current Weather
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: isDarkMode ? Colors.black : Colors.black,
                  backgroundColor: '#FFFFFF',
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 4,
                  marginTop: 10,
                },
              ]}>
              Temp: {currentWeather.temperature2m}, Rainny:{' '}
              {currentWeather.rain ? 'Yes' : 'No'}
            </Text>
          </>
        ) : (
          <></>
        )}
        {!isLoading && dailyWeathers.length > 0 ? (
          <>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: isDarkMode ? Colors.black : Colors.black,
                  marginTop: 10,
                  textAlign: 'center',
                },
              ]}>
              Daily Weather
            </Text>
            <View
              style={{
                backgroundColor: '#FFFFFF',
                padding: 10,
                borderWidth: 1,
                borderRadius: 4,
                marginTop: 10,
              }}>
              {dailyWeathers.map((x, i) => (
                <Text
                  key={i}
                  style={[
                    styles.subtitle,
                    {
                      color: isDarkMode ? Colors.black : Colors.black,
                      marginTop: i === 0 ? 0 : 4,
                    },
                  ]}>
                  {x.time?.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  :{' '}
                  <Text style={{color: '#E42B76'}}>
                    min. {x.temperature2mMin}℃, max. {x.temperature2mMax}℃
                  </Text>
                </Text>
              ))}
            </View>
          </>
        ) : (
          <></>
        )}
      </View>
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
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
  },
});
