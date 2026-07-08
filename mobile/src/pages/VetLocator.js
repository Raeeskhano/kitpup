import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../api/config';

const MOCK_VETS = [
  { _id: "1", name: "Abbottabad Pet Clinic", address: "Mansehra Road, Abbottabad", distance: "1.2 km away", rating: 4.9, isOpen: true, isEmergency: false, lat: 34.1561, lng: 73.2215 },
  { _id: "2", name: "Hazara Animal Hospital", address: "Jinnahabad, Abbottabad", distance: "2.5 km away", rating: 4.7, isOpen: true, isEmergency: true, lat: 34.1683, lng: 73.2247 },
  { _id: "3", name: "City Vet Center", address: "Supply Bazar, Abbottabad", distance: "3.8 km away", rating: 4.5, isOpen: false, isEmergency: false, lat: 34.1448, lng: 73.2123 },
];

const DEFAULT_CENTER = { lat: 34.1495, lng: 73.2182 }; // Abbottabad, Pakistan

export default function VetLocator() {
  const [filter, setFilter] = useState('Open Now');
  const [vets, setVets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVetId, setSelectedVetId] = useState(null);

  useEffect(() => {
    const fetchVets = async () => {
      setIsLoading(true);
      try {
        const stored = await AsyncStorage.getItem('kitpup_user');
        let token = stored ? JSON.parse(stored).token : '';
        let query = 'open';
        if (filter === 'Emergency') query = 'emergency';
        if (filter === 'Top Rated') query = 'top_rated';
        
        const res = await axios.get(`${API_URL}/api/v1/vets?filter=${query}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data && res.data.data) {
          setVets(res.data.data);
        } else {
          throw new Error('Fallback to mock');
        }
      } catch (err) {
        let filteredMocks = [...MOCK_VETS];
        if (filter === 'Open Now') {
          filteredMocks = filteredMocks.filter(v => v.isOpen);
        } else if (filter === 'Emergency') {
          filteredMocks = filteredMocks.filter(v => v.isEmergency);
        } else if (filter === 'Top Rated') {
          filteredMocks = filteredMocks.sort((a, b) => b.rating - a.rating);
        }
        
        setTimeout(() => {
          setVets(filteredMocks);
          setIsLoading(false);
        }, 500);
        return;
      }
      setIsLoading(false);
    };

    fetchVets();
  }, [filter]);

  const selectedVetObj = vets.find(v => v._id === selectedVetId);

  const markersScript = vets.map(vet => `
    var m = L.marker([${vet.lat}, ${vet.lng}]).addTo(map);
    m.bindPopup("<b>${vet.name}</b><br>${vet.address}");
    m.on('click', function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'VET_CLICK', id: '${vet._id}' }));
    });
  `).join('\n');

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { padding: 0; margin: 0; }
        html, body, #map { height: 100%; width: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {zoomControl: false}).setView([${DEFAULT_CENTER.lat}, ${DEFAULT_CENTER.lng}], 12);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);
        
        ${markersScript}

        window.flyToVet = function(lat, lng) {
          map.flyTo([lat, lng], 14, { duration: 1.5 });
        }
      </script>
    </body>
    </html>
  `;

  const handleMapMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'VET_CLICK') {
        setSelectedVetId(data.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getInjectedJavaScript = () => {
    if (selectedVetObj) {
      return `window.flyToVet(${selectedVetObj.lat}, ${selectedVetObj.lng}); true;`;
    }
    return '';
  };

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 pt-8 border-b border-gray-100 bg-white">
        <Text className="text-2xl font-bold text-gray-800 mb-4">Nearby Clinics</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          {['Open Now', 'Emergency', 'Top Rated'].map(f => (
            <TouchableOpacity 
              key={f}
              onPress={() => { setFilter(f); setSelectedVetId(null); }}
              className={`mr-2 px-4 py-2 rounded-full ${filter === f ? 'bg-orange-500' : 'bg-gray-100 border border-gray-200'}`}
            >
              <Text className={`font-bold text-xs ${filter === f ? 'text-white' : 'text-gray-600'}`}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View className="flex-1">
        <View className="h-1/2">
          <WebView 
            source={{ html: mapHtml }}
            onMessage={handleMapMessage}
            injectedJavaScript={getInjectedJavaScript()}
          />
        </View>

        <ScrollView className="flex-1 bg-gray-50 p-4">
          {isLoading ? (
            <ActivityIndicator color="#f97316" size="large" className="mt-10" />
          ) : vets.length === 0 ? (
            <Text className="text-center text-gray-500 mt-10">No clinics found.</Text>
          ) : (
            vets.map(vet => (
              <TouchableOpacity 
                key={vet._id} 
                onPress={() => setSelectedVetId(vet._id)}
                className={`p-4 mb-3 border rounded-xl bg-white ${selectedVetId === vet._id ? 'border-orange-500 bg-orange-50/50' : 'border-gray-100'}`}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className={`font-bold text-lg ${selectedVetId === vet._id ? 'text-orange-500' : 'text-gray-800'}`}>
                    {vet.name}
                  </Text>
                  <Text className="text-orange-500 font-bold text-sm">★ {vet.rating}</Text>
                </View>
                
                <Text className="text-xs text-gray-500 mb-3">{vet.distance} • {vet.address}</Text>
                
                <View className="flex-row items-center justify-between">
                  {vet.isOpen ? (
                    <View className="bg-gray-100 px-2 py-1 rounded flex-row items-center">
                      <View className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1" />
                      <Text className="text-[10px] font-bold text-gray-700 uppercase">Open Now</Text>
                    </View>
                  ) : (
                    <View className="bg-gray-100 px-2 py-1 rounded flex-row items-center">
                      <View className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1" />
                      <Text className="text-[10px] font-bold text-gray-500 uppercase">Closed</Text>
                    </View>
                  )}
                  
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation();
                      Linking.openURL(`https://maps.google.com/maps?q=${encodeURIComponent(vet.address)}`);
                    }}
                  >
                    <Text className="text-orange-500 text-xs font-bold hover:underline">Directions</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}
