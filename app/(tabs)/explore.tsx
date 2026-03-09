import { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import axios from 'axios';

const API_KEY = 'a5132e80459cfdf807bda944ecd835ea';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

export default function SearchScreen() {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchWeatherByCity = async () => {
    if (!city.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric',
          lang: 'kr'
        }
      });
      setWeather(res.data);
    } catch (e) {
      Alert.alert('도시를 찾을 수 없어요 😢');
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 도시 검색</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="도시 이름 입력 (영문)"
          value={city}
          onChangeText={setCity}
          onSubmitEditing={fetchWeatherByCity}
        />
        <TouchableOpacity style={styles.button} onPress={fetchWeatherByCity}>
          <Text style={styles.buttonText}>검색</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 40 }} />}

      {!loading && weather && (
        <View style={styles.weatherCard}>
          <Text style={styles.emoji}>{getWeatherEmoji(weather.weather[0].main)}</Text>
          <Text style={styles.cityName}>{weather.name}</Text>
          <Text style={styles.temp}>{Math.round(weather.main.temp)}°C</Text>
          <Text style={styles.desc}>{weather.weather[0].description}</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detail}>💧 습도 {weather.main.humidity}%</Text>
            <Text style={styles.detail}>💨 풍속 {weather.wind.speed}m/s</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF4FB', alignItems: 'center', paddingTop: 80 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#2C3E50' },
  searchRow: { flexDirection: 'row', marginBottom: 24, paddingHorizontal: 20 },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#B0C4DE', borderRadius: 10,
    padding: 10, backgroundColor: '#fff', fontSize: 16
  },
  button: {
    backgroundColor: '#4A90E2', padding: 10, borderRadius: 10,
    marginLeft: 8, justifyContent: 'center'
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  weatherCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 32,
    alignItems: 'center', width: '85%',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  emoji: { fontSize: 72, marginBottom: 8 },
  cityName: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50', marginBottom: 4 },
  temp: { fontSize: 56, fontWeight: 'bold', color: '#4A90E2', marginBottom: 4 },
  desc: { fontSize: 18, color: '#7F8C8D', marginBottom: 16, textTransform: 'capitalize' },
  detailRow: { flexDirection: 'row', gap: 20, marginBottom: 8 },
  detail: { fontSize: 15, color: '#555' },
});