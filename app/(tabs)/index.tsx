import axios from 'axios';
import * as Location from 'expo-location';
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert,
  StyleSheet, Text,
  TouchableOpacity,
  View
} from 'react-native';

const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

export default function TodayScreen() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const animationRef = useRef(null);

  useEffect(() => {
    fetchWeatherByLocation();
  }, []);

  const fetchWeatherByLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('위치 권한이 필요합니다');
        setLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const res = await axios.get(API_URL, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: API_KEY,
          units: 'metric',
          lang: 'kr'
        }
      });
      setWeather(res.data);
    } catch (e) {
      console.log('에러:', e.response?.status, e.response?.data);
      Alert.alert('날씨를 불러오지 못했어요 😢');
    }
    setLoading(false);
  };

  const getWeatherEmoji = (main) => {
    const map = {
      Clear: '☀️', Clouds: '☁️', Rain: '🌧️',
      Snow: '❄️', Thunderstorm: '⛈️', Mist: '🌫️'
    };
    return map[main] || '🌈';
  };

  const getBackgroundColor = (main) => {
    const map = {
      Clear: '#87CEEB',
      Clouds: '#B0BEC5',
      Rain: '#546E7A',
      Snow: '#E3F2FD',
      Thunderstorm: '#37474F',
      Mist: '#CFD8DC',
    };
    return map[main] || '#EAF4FB';
  };

  const getAnimation = (main) => {
    const map = {
      Clear: require('../../assets/animations/sunny.json'),
      Clouds: require('../../assets/animations/cloudy.json'),
      Rain: require('../../assets/animations/rain.json'),
      Thunderstorm: require('../../assets/animations/rain.json'),
      Snow: require('../../assets/animations/snow.json'),
      Mist: require('../../assets/animations/cloudy.json'),
    };
    return map[main] || require('../../assets/animations/sunny.json');
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: weather ? getBackgroundColor(weather.weather[0].main) : '#EAF4FB' }
    ]}>
      <Text style={styles.title}>📍 현재 위치 날씨</Text>

      <TouchableOpacity style={styles.refreshButton} onPress={fetchWeatherByLocation}>
        <Text style={styles.refreshText}>🔄 새로고침</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 40 }} />}

      {!loading && weather && (
        <View style={styles.weatherCard}>

          {/* Lottie 애니메이션 */}
          <LottieView
            ref={animationRef}
            source={getAnimation(weather.weather[0].main)}
            autoPlay
            loop
            style={styles.animation}
          />

          <Text style={styles.cityName}>{weather.name}</Text>
          <Text style={styles.temp}>{Math.round(weather.main.temp)}°C</Text>
          <Text style={styles.desc}>{weather.weather[0].description}</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detail}>💧 습도 {weather.main.humidity}%</Text>
            <Text style={styles.detail}>💨 풍속 {weather.wind.speed}m/s</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detail}>🌡️ 최고 {Math.round(weather.main.temp_max)}°C</Text>
            <Text style={styles.detail}>🌡️ 최저 {Math.round(weather.main.temp_min)}°C</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 80 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#2C3E50' },
  refreshButton: {
    backgroundColor: '#5DADE2', paddingVertical: 10, paddingHorizontal: 24,
    borderRadius: 20, marginBottom: 32
  },
  refreshText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  weatherCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 32,
    alignItems: 'center', width: '85%',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  animation: { width: 150, height: 150, marginBottom: 8 },
  cityName: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50', marginBottom: 4 },
  temp: { fontSize: 56, fontWeight: 'bold', color: '#4A90E2', marginBottom: 4 },
  desc: { fontSize: 18, color: '#7F8C8D', marginBottom: 16, textTransform: 'capitalize' },
  detailRow: { flexDirection: 'row', gap: 20, marginBottom: 8 },
  detail: { fontSize: 15, color: '#555' },
});