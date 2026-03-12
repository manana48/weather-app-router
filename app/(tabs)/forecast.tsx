import axios from 'axios';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert,
    ScrollView,
    StyleSheet, Text, View
} from 'react-native';

const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const AIR_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';

export default function ForecastScreen() {
  const [forecast, setForecast] = useState([]);
  const [air, setAir] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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

      // 5일 예보 + 미세먼지 동시 호출
      const [forecastRes, airRes] = await Promise.all([
        axios.get(FORECAST_URL, {
          params: { lat: latitude, lon: longitude, appid: API_KEY, units: 'metric', lang: 'kr' }
        }),
        axios.get(AIR_URL, {
          params: { lat: latitude, lon: longitude, appid: API_KEY }
        })
      ]);

      // 5일치 날짜별로 정리 (하루 한 번 12시 데이터만)
      const daily = forecastRes.data.list.filter(item =>
        item.dt_txt.includes('12:00:00')
      );
      setForecast(daily);
      setAir(airRes.data.list[0]);
    } catch (e) {
      console.log('에러:', e.response?.status, e.response?.data);
      Alert.alert('데이터를 불러오지 못했어요 😢');
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

  const getAirQuality = (aqi) => {
    const map = {
      1: { label: '좋음', color: '#4CAF50' },
      2: { label: '보통', color: '#8BC34A' },
      3: { label: '보통', color: '#FFC107' },
      4: { label: '나쁨', color: '#FF5722' },
      5: { label: '매우 나쁨', color: '#B71C1C' },
    };
    return map[aqi] || { label: '알 수 없음', color: '#999' };
  };

  const formatDate = (dtTxt) => {
    const date = new Date(dtTxt);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getMonth() + 1}/${date.getDate()} (${days[date.getDay()]})`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>📅 5일 예보</Text>

      {loading && <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 40 }} />}

      {/* 미세먼지 */}
      {!loading && air && (
        <View style={styles.airCard}>
          <Text style={styles.airTitle}>🌫️ 미세먼지</Text>
          <View style={styles.airRow}>
            <View style={styles.airItem}>
              <Text style={styles.airLabel}>대기질</Text>
              <Text style={[styles.airValue, { color: getAirQuality(air.main.aqi).color }]}>
                {getAirQuality(air.main.aqi).label}
              </Text>
            </View>
            <View style={styles.airItem}>
              <Text style={styles.airLabel}>PM2.5</Text>
              <Text style={styles.airValue}>{air.components.pm2_5} ㎍/㎥</Text>
            </View>
            <View style={styles.airItem}>
              <Text style={styles.airLabel}>PM10</Text>
              <Text style={styles.airValue}>{air.components.pm10} ㎍/㎥</Text>
            </View>
          </View>
        </View>
      )}

      {/* 5일 예보 */}
      {!loading && forecast.map((item, index) => (
        <View key={index} style={styles.forecastCard}>
          <Text style={styles.date}>{formatDate(item.dt_txt)}</Text>
          <Text style={styles.emoji}>{getWeatherEmoji(item.weather[0].main)}</Text>
          <Text style={styles.desc}>{item.weather[0].description}</Text>
          <View style={styles.tempRow}>
            <Text style={styles.tempHigh}>최고 {Math.round(item.main.temp_max)}°C</Text>
            <Text style={styles.tempLow}>최저 {Math.round(item.main.temp_min)}°C</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detail}>💧 {item.main.humidity}%</Text>
            <Text style={styles.detail}>💨 {item.wind.speed}m/s</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF4FB' },
  content: { alignItems: 'center', paddingTop: 80, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#2C3E50' },
  airCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    width: '85%', marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  airTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 12 },
  airRow: { flexDirection: 'row', justifyContent: 'space-around' },
  airItem: { alignItems: 'center' },
  airLabel: { fontSize: 13, color: '#999', marginBottom: 4 },
  airValue: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50' },
  forecastCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    width: '85%', marginBottom: 12, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  date: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50', marginBottom: 8 },
  emoji: { fontSize: 40, marginBottom: 4 },
  desc: { fontSize: 14, color: '#7F8C8D', marginBottom: 8, textTransform: 'capitalize' },
  tempRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  tempHigh: { fontSize: 15, fontWeight: 'bold', color: '#E74C3C' },
  tempLow: { fontSize: 15, fontWeight: 'bold', color: '#3498DB' },
  detailRow: { flexDirection: 'row', gap: 16 },
  detail: { fontSize: 13, color: '#555' },
});