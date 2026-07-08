import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Camera, MapPin, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { API_URL } from '../api/config';

export default function RescueReport() {
  const [photoUris, setPhotoUris] = useState([]);
  const [animalType, setAnimalType] = useState('Dog');
  const [urgencyLevel, setUrgencyLevel] = useState('High - Immediate Danger');
  const [locationName, setLocationName] = useState('');
  const [mapPosition, setMapPosition] = useState({ lat: 34.1495, lng: 73.2115 });
  const [description, setDescription] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  // For native pickers we can just use ActionSheet or a custom modal for now
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showUrgencyModal, setShowUrgencyModal] = useState(false);

  const fetchRecentReports = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('kitpup_user');
      let token = storedUser ? JSON.parse(storedUser).token : '';
      
      const res = await axios.get(`${API_URL}/api/v1/reports?nearby=true&limit=3`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecentReports(res.data.data);
    } catch (err) {
      console.error('Failed to load recent reports', err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchRecentReports();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uris = result.assets.map(a => a.uri);
      setPhotoUris(prev => [...prev, ...uris]);
    }
  };

  const removePhoto = (index) => {
    setPhotoUris(prev => prev.filter((_, i) => i !== index));
  };

  const handleUseCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      setLocationName('Locating...');
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setMapPosition({ lat: latitude, lng: longitude });
      
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      if (res.data && res.data.display_name) {
        const parts = res.data.display_name.split(',');
        setLocationName(parts.slice(0, 3).join(', '));
      } else {
        setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } catch (err) {
      console.error(err);
      setLocationName(`${mapPosition.lat.toFixed(4)}, ${mapPosition.lng.toFixed(4)}`);
    }
  };

  const handleMapMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MAP_CLICK') {
        const { lat, lng } = data;
        setMapPosition({ lat, lng });
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        if (res.data && res.data.display_name) {
          const parts = res.data.display_name.split(',');
          setLocationName(parts.slice(0, 3).join(', '));
        } else {
          setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      }
    } catch (e) {
      console.error('Error parsing map message', e);
    }
  };

  const handleSubmit = async () => {
    if (photoUris.length === 0) {
      Alert.alert('Error', 'At least one photo is required to submit a report.');
      return;
    }
    if (!locationName) {
      Alert.alert('Error', 'Location is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const storedUser = await AsyncStorage.getItem('kitpup_user');
      let token = storedUser ? JSON.parse(storedUser).token : '';

      const formData = new FormData();
      formData.append('type', 'rescue');
      formData.append('animalType', animalType);
      formData.append('urgencyLevel', urgencyLevel);
      formData.append('location', locationName);
      formData.append('description', description);
      
      photoUris.forEach(uri => {
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('photos', { uri, name: filename, type });
      });

      await axios.post(`${API_URL}/api/v1/reports`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      Alert.alert('Success', 'Report submitted successfully! Rescue teams have been notified.');
      setPhotoUris([]);
      setAnimalType('Dog');
      setUrgencyLevel('High - Immediate Danger');
      setLocationName('');
      setDescription('');
      fetchRecentReports();
      
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.error || 'An error occurred while submitting the report.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        var map = L.map('map', {zoomControl: false}).setView([${mapPosition.lat}, ${mapPosition.lng}], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);
        
        var marker = L.marker([${mapPosition.lat}, ${mapPosition.lng}]).addTo(map);

        map.on('click', function(e) {
          var lat = e.latlng.lat;
          var lng = e.latlng.lng;
          marker.setLatLng(e.latlng);
          map.setView(e.latlng);
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_CLICK', lat: lat, lng: lng }));
        });

        // Function exposed to react native to update pin
        window.updatePin = function(lat, lng) {
          marker.setLatLng([lat, lng]);
          map.setView([lat, lng], 13);
        }
      </script>
    </body>
    </html>
  `;

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4 pt-8">
        <Text className="text-3xl font-bold text-gray-800 mb-2">Rescue Report</Text>
        <Text className="text-gray-500 mb-6">Report animals in need to local rescue teams.</Text>

        {/* Photo Upload */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-gray-800 mb-2">Photo Evidence *</Text>
          <TouchableOpacity 
            onPress={pickImage}
            className="border-2 border-dashed border-orange-500 bg-orange-50/50 rounded-2xl p-6 items-center justify-center min-h-[120px]"
          >
            <View className="w-12 h-12 bg-white rounded-full items-center justify-center mb-2 shadow-sm">
              <Camera color="#f97316" size={24} />
            </View>
            <Text className="font-bold text-orange-500">Upload Photos</Text>
            <Text className="text-xs text-gray-500 mt-1">Clear photos help immensely</Text>
          </TouchableOpacity>

          {photoUris.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 flex-row">
              {photoUris.map((uri, i) => (
                <View key={i} className="relative mr-3 w-20 h-20 rounded-xl overflow-hidden">
                  <Image source={{ uri }} className="w-full h-full object-cover" />
                  <TouchableOpacity 
                    onPress={() => removePhoto(i)}
                    className="absolute top-1 right-1 bg-red-500 w-5 h-5 rounded-full items-center justify-center"
                  >
                    <Text className="text-white text-xs font-bold">X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Location */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-bold text-gray-800">Approximate Location *</Text>
            <TouchableOpacity onPress={handleUseCurrentLocation} className="bg-orange-50 px-3 py-1.5 rounded-full flex-row items-center">
              <MapPin color="#f97316" size={12} className="mr-1" />
              <Text className="text-xs font-bold text-orange-500">Use Current</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput 
            value={locationName}
            onChangeText={setLocationName}
            placeholder="Address or landmark..."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white mb-3"
          />

          <View className="h-[200px] bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
            <WebView 
              source={{ html: mapHtml }}
              onMessage={handleMapMessage}
              scrollEnabled={false}
              injectedJavaScript={`window.updatePin(${mapPosition.lat}, ${mapPosition.lng}); true;`}
            />
          </View>
        </View>

        {/* Form Fields */}
        <View className="mb-4">
          <Text className="text-sm font-bold text-gray-800 mb-2">Animal Type *</Text>
          <TouchableOpacity 
            onPress={() => setShowTypeModal(true)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white"
          >
            <Text className="text-gray-800">{animalType || 'Select Type...'}</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-bold text-gray-800 mb-2">Urgency Level *</Text>
          <TouchableOpacity 
            onPress={() => setShowUrgencyModal(true)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white"
          >
            <Text className="text-gray-800">{urgencyLevel || 'Select Urgency...'}</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-8">
          <Text className="text-sm font-bold text-gray-800 mb-2">Description & Condition</Text>
          <TextInput 
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            placeholder="Injuries, behavior, etc..."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white min-h-[100px] text-top"
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity 
          onPress={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#92400E] py-4 rounded-xl flex-row justify-center items-center mb-8"
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <AlertTriangle color="white" size={20} className="mr-2" />
              <Text className="text-white font-bold text-lg">Submit Report</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Recent Reports */}
        <Text className="text-xl font-bold text-gray-800 mb-4">Recent Area Reports</Text>
        {loadingReports ? (
          <ActivityIndicator color="#f97316" />
        ) : recentReports.length === 0 ? (
          <Text className="text-gray-500 mb-8">No recent reports in your area.</Text>
        ) : (
          <View className="mb-8">
            {recentReports.map(report => (
              <View key={report._id} className="bg-white p-4 rounded-xl border border-gray-100 mb-3 flex-row shadow-sm">
                <View className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-4">
                  {report.photos && report.photos.length > 0 ? (
                    <Image source={{ uri: report.photos[0] }} className="w-full h-full" />
                  ) : (
                    <View className="w-full h-full items-center justify-center bg-gray-200" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-800">{report.animalType}</Text>
                  <Text className="text-xs text-gray-500 line-clamp-1 mb-1">{report.description}</Text>
                  <Text className="text-[10px] font-bold text-orange-500 uppercase">{report.status.replace(/_/g, ' ')}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

      </View>

      {/* Select Modals */}
      <Modal visible={showTypeModal} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/50 justify-center p-4">
          <View className="bg-white rounded-2xl p-4">
            <Text className="text-lg font-bold mb-4 text-center">Select Animal Type</Text>
            {['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'].map(type => (
              <TouchableOpacity 
                key={type} 
                onPress={() => { setAnimalType(type); setShowTypeModal(false); }}
                className="py-3 border-b border-gray-100 items-center"
              >
                <Text className="text-base text-gray-800">{type}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowTypeModal(false)} className="py-4 mt-2 items-center">
              <Text className="text-red-500 font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showUrgencyModal} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/50 justify-center p-4">
          <View className="bg-white rounded-2xl p-4">
            <Text className="text-lg font-bold mb-4 text-center">Select Urgency</Text>
            {['High - Immediate Danger', 'Medium - Needs Attention', 'Low - Stable'].map(urg => (
              <TouchableOpacity 
                key={urg} 
                onPress={() => { setUrgencyLevel(urg); setShowUrgencyModal(false); }}
                className="py-3 border-b border-gray-100 items-center"
              >
                <Text className="text-base text-gray-800">{urg}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowUrgencyModal(false)} className="py-4 mt-2 items-center">
              <Text className="text-red-500 font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}
