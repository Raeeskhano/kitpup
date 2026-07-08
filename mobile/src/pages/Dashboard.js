import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { ClipboardList, Heart, AlertTriangle, Calendar, ShoppingBag } from 'lucide-react-native';
import { API_URL } from '../api/config';

export default function Dashboard() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({
    activeListings: 0,
    rescuedNearby: 0,
    lostPets: 0
  });
  
  const [activityFeed, setActivityFeed] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('kitpup_user');
        let token = '';
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.token || ''; 
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const [
          activePetsRes,
          rescuedRes,
          lostPetsRes,
          recentReportsRes,
          recentLostPetsRes
        ] = await Promise.all([
          axios.get(`${API_URL}/api/v1/pets?status=active`, config),
          axios.get(`${API_URL}/api/v1/reports?nearby=true`, config),
          axios.get(`${API_URL}/api/v1/pets?status=lost`, config),
          axios.get(`${API_URL}/api/v1/reports?limit=10`, config),
          axios.get(`${API_URL}/api/v1/pets?status=lost&limit=5`, config)
        ]);

        setStats({
          activeListings: activePetsRes.data.count || activePetsRes.data.data?.length || 0,
          rescuedNearby: rescuedRes.data.count || rescuedRes.data.data?.length || 0,
          lostPets: lostPetsRes.data.count || lostPetsRes.data.data?.length || 0
        });

        const reports = (recentReportsRes.data.data || []).map(r => ({
          ...r,
          feedType: 'report',
          dateObj: new Date(r.createdAt)
        }));
        
        const lostPets = (recentLostPetsRes.data.data || []).map(p => ({
          ...p,
          feedType: 'pet',
          dateObj: new Date(p.createdAt)
        }));

        const merged = [...reports, ...lostPets]
          .sort((a, b) => b.dateObj - a.dateObj)
          .slice(0, 3);

        setActivityFeed(merged);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
        setError('Could not load dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (isNaN(seconds)) return "A while ago";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const getActivityDetails = (item) => {
    if (item.feedType === 'report') {
      if (item.type === 'rescue') {
        return {
          icon: <Heart color="white" size={20} />,
          bgClass: 'bg-green-500',
          textClass: 'text-gray-800',
          title: `${item.petType || 'Pet'} was rescued!`,
          subtitle: `${formatTimeAgo(item.dateObj)} • Rescue Report`,
          route: 'RescueReport',
          wrapperClass: 'bg-white'
        };
      } else {
        return {
          icon: <AlertTriangle color="white" size={20} />,
          bgClass: 'bg-red-600',
          textClass: 'text-red-900',
          title: `Alert: Missing ${item.petType || 'pet'} reported in your area.`,
          subtitle: `${formatTimeAgo(item.dateObj)} • ${item.location || '0.5 miles away'}`,
          route: 'RescueReport',
          wrapperClass: 'bg-red-50 border border-red-100'
        };
      }
    } else {
      if (item.status === 'lost') {
        return {
          icon: <AlertTriangle color="white" size={20} />,
          bgClass: 'bg-red-600',
          textClass: 'text-red-900',
          title: `Alert: ${item.name || 'Pet'} is missing!`,
          subtitle: `${formatTimeAgo(item.dateObj)} • 0.5 miles away`,
          route: 'LostFound',
          wrapperClass: 'bg-red-50 border border-red-100'
        };
      } else {
        return {
          icon: <ShoppingBag color="#6b7280" size={20} />,
          bgClass: 'bg-gray-100 border border-gray-200',
          textClass: 'text-gray-800',
          title: `${item.name || 'Pet supply'} listed nearby.`,
          subtitle: `${formatTimeAgo(item.dateObj)} • Marketplace`,
          route: 'Marketplace',
          wrapperClass: 'bg-white'
        };
      }
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
        .custom-map-marker { background: transparent; border: none; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {zoomControl: false}).setView([34.1495, 73.2182], 13);
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        const getRescueIcon = () => new L.divIcon({
          className: 'custom-map-marker',
          html: '<div style="display: flex; flex-direction: column; align-items: center;"><div style="background-color: #dc2626; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 2px solid white;"><svg style="width: 20px; height: 20px; color: white;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-2-9.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm4 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm-2 4.5c-1.7 0-3-1.3-3-3h6c0 1.7-1.3 3-3 3z"/></svg></div><div style="width: 8px; height: 8px; background-color: #dc2626; border-radius: 50%; margin-top: 4px;"></div></div>',
          iconSize: [40, 52], iconAnchor: [20, 52]
        });

        const getListingIcon = () => new L.divIcon({
          className: 'custom-map-marker',
          html: '<div style="display: flex; flex-direction: column; align-items: center;"><div style="background-color: #92400E; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 2px solid white;"><svg style="width: 20px; height: 20px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg></div><div style="width: 8px; height: 8px; background-color: #92400E; border-radius: 50%; margin-top: 4px;"></div></div>',
          iconSize: [40, 52], iconAnchor: [20, 52]
        });

        const getHomeIcon = () => new L.divIcon({
          className: 'custom-map-marker',
          html: '<div style="display: flex; flex-direction: column; align-items: center;"><div style="background-color: #1f2937; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 2px solid white;"><svg style="width: 20px; height: 20px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg></div><div style="width: 8px; height: 8px; background-color: #1f2937; border-radius: 50%; margin-top: 4px;"></div></div>',
          iconSize: [40, 52], iconAnchor: [20, 52]
        });

        L.marker([34.1561, 73.2215], {icon: getRescueIcon()}).bindPopup("<b>Missing Golden Retriever</b>").addTo(map);
        L.marker([34.1448, 73.2123], {icon: getListingIcon()}).bindPopup("<b>Free Dog Bed</b>").addTo(map);
        L.marker([34.1495, 73.2182], {icon: getHomeIcon()}).bindPopup("<b>Your Location</b>").addTo(map);
      </script>
    </body>
    </html>
  `;

  return (
    <ScrollView className="flex-1 bg-white p-4">
      {error && (
        <View className="bg-red-100 border border-red-400 p-3 rounded-xl mb-4">
          <Text className="text-red-700 font-medium">{error}</Text>
        </View>
      )}

      <View className="mb-6">
        <Text className="text-3xl font-bold text-gray-800 mb-1">Dashboard</Text>
        <Text className="text-gray-500">Here's what's happening today.</Text>
      </View>

      {/* Stats row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
        <TouchableOpacity 
          className="bg-white rounded-2xl p-5 border border-gray-100 mr-4 shadow-sm w-48"
          onPress={() => navigation.navigate('Marketplace')}
        >
          <View className="w-12 h-12 rounded-full bg-orange-50 items-center justify-center mb-3">
            <ClipboardList color="#f97316" size={24} />
          </View>
          <Text className="text-xs font-bold text-gray-500 uppercase mb-1">Active Listings</Text>
          <Text className="text-2xl font-bold text-gray-800">{stats.activeListings}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-white rounded-2xl p-5 border border-gray-100 mr-4 shadow-sm w-48"
          onPress={() => navigation.navigate('RescueReport')}
        >
          <View className="w-12 h-12 rounded-full bg-orange-50 items-center justify-center mb-3">
            <Heart color="#f97316" size={24} />
          </View>
          <Text className="text-xs font-bold text-gray-500 uppercase mb-1">Rescued Nearby</Text>
          <Text className="text-2xl font-bold text-gray-800">{stats.rescuedNearby}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-red-100 rounded-2xl p-5 border border-red-200 mr-4 shadow-sm w-48"
          onPress={() => navigation.navigate('LostFound')}
        >
          <View className="w-12 h-12 rounded-full bg-red-500 items-center justify-center mb-3">
            <AlertTriangle color="white" size={24} />
          </View>
          <Text className="text-xs font-bold text-red-800 uppercase mb-1">Lost Pet Alerts</Text>
          <Text className="text-2xl font-bold text-red-600">{stats.lostPets}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Map */}
      <View className="bg-[#f0ede6] rounded-3xl overflow-hidden h-[300px] mb-6 relative">
        <WebView 
          source={{ html: mapHtml }}
          style={{ flex: 1 }}
          scrollEnabled={false}
        />
        <View className="absolute top-4 left-4 right-4 bg-white/90 rounded-xl p-3 flex-row items-center justify-between">
          <View>
            <Text className="font-bold text-gray-800 text-lg">Community Map</Text>
            <Text className="text-xs text-gray-500 font-medium">Showing active alerts.</Text>
          </View>
        </View>
      </View>

      {/* Activity Feed */}
      <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
        <Text className="text-xl font-bold text-gray-800 mb-6">Recent Activity</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#f97316" />
        ) : (
          <View className="space-y-4">
            {activityFeed.map((item, index) => {
              const details = getActivityDetails(item);
              return (
                <TouchableOpacity 
                  key={index}
                  onPress={() => navigation.navigate(details.route)}
                  className={`flex-row items-start p-3 rounded-xl mb-2 ${details.wrapperClass}`}
                >
                  <View className={`w-10 h-10 rounded-full items-center justify-center mt-1 mr-4 ${details.bgClass}`}>
                    {details.icon}
                  </View>
                  <View className="flex-1">
                    <Text className={`text-sm font-medium ${details.textClass}`}>{details.title}</Text>
                    <Text className="text-xs text-gray-500 mt-1">{details.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity 
              onPress={() => navigation.navigate('Maps')}
              className="flex-row items-start p-3 rounded-xl border border-transparent"
            >
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center border border-gray-200 mt-1 mr-4">
                <Calendar color="#6b7280" size={20} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-800">Upcoming vet appointment for Luna.</Text>
                <Text className="text-xs text-gray-500 mt-1">Tomorrow at 10:00 AM</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>

    </ScrollView>
  );
}
