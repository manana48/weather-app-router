import axios from 'axios';
import { useState } from 'react';
import {
  ActivityIndicator, Alert,
  StyleSheet, Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const GEO_URL = 'http://api.openweathermap.org/geo/1.0/direct';

export default function SearchScreen() {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleInputChange = async (text) => {
    setCity(text);

    if (text.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    // 영문 입력시만 자동완성
    const isEnglish = /^[a-zA-Z\s]+$/.test(text);
    if (!isEnglish) {
      setSuggestions([]);
      return;
    }

    try {
      setSearching(true);
      const res = await axios.get(GEO_URL, {
        params: {
          q: text,
          limit: 5,
          appid: API_KEY,
        }
      });
      setSuggestions(res.data);
    } catch (e) {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSuggestionPress = (item) => {
    const displayName = item.local_names?.ko || item.name;
    setCity(displayName);
    setSuggestions([]);
    fetchWeatherByCoords(item.lat, item.lon);
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        params: {
          lat, lon,
          appid: API_KEY,
          units: 'metric',
          lang: 'kr'
        }
      });
      setWeather(res.data);
    } catch (e) {
      Alert.alert('날씨를 불러오지 못했어요 😢');
    }
    setLoading(false);
  };

  const fetchWeatherByCity = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setSuggestions([]);
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

      <View style={styles.searchWrapper}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="도시 이름 (한글/영문)"
            value={city}
            onChangeText={handleInputChange}
            onSubmitEditing={fetchWeatherByCity}
          />
          <TouchableOpacity style={styles.button} onPress={fetchWeatherByCity}>
            {searching
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.buttonText}>검색</Text>
            }
          </TouchableOpacity>
        </View>

        {/* 자동완성 드롭다운 */}
        {suggestions.length > 0 && (
          <View style={styles.dropdown}>
            {suggestions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownItem}
                onPress={() => handleSuggestionPress(item)}
              >
                <Text style={styles.dropdownName}>
                  {item.local_names?.ko || item.name}
                </Text>
                <Text style={styles.dropdownSub}>
                  {item.name}, {item.country}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* 빠른 검색 버튼 */}
      <View style={styles.quickRow}>
        {[
          { label: '서울', lat: 37.5665, lon: 126.9780 },
          { label: '부산', lat: 35.1796, lon: 129.0756 },
          { label: '제주', lat: 33.4996, lon: 126.5312 },
          { label: '도쿄', lat: 35.6762, lon: 139.6503 },
          { label: '뉴욕', lat: 40.7128, lon: -74.0060 },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.quickButton}
            onPress={() => {
              setCity(item.label);
              setSuggestions([]);
              fetchWeatherByCoords(item.lat, item.lon);
            }}
          >
            <Text style={styles.quickText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
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
  searchWrapper: { width: '90%', marginBottom: 12, zIndex: 10 },
  searchRow: { flexDirection: 'row' },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#B0C4DE', borderRadius: 10,
    padding: 10, backgroundColor: '#fff', fontSize: 16
  },
  button: {
    backgroundColor: '#4A90E2', padding: 10, borderRadius: 10,
    marginLeft: 8, justifyContent: 'center', minWidth: 60, alignItems: 'center'
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  dropdown: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#B0C4DE',
    borderRadius: 10, marginTop: 4,
  },
  dropdownItem: {
    paddingVertical: 10, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: '#EEE'
  },
  dropdownName: { fontSize: 15, color: '#2C3E50', fontWeight: 'bold' },
  dropdownSub: { fontSize: 12, color: '#999', marginTop: 2 },
  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' },
  quickButton: {
    backgroundColor: '#fff', paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 20, borderWidth: 1, borderColor: '#B0C4DE'
  },
  quickText: { fontSize: 13, color: '#2C3E50' },
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