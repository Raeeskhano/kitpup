import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform, Image, Alert, DeviceEventEmitter } from 'react-native';
import { Bell, ArrowLeft, ShoppingCart } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../api/config';

export default function TopBar({ title, back, navigation, user: globalUser }) {
  const [user, setUser] = useState(globalUser);
  const [cartCount, setCartCount] = useState(0);

  const fetchCart = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('kitpup_user');
      if (stored) {
        const token = JSON.parse(stored).token;
        if (token) {
          const res = await axios.get(`${API_URL}/api/v1/products/cart`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const count = res.data.data.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(count);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (globalUser) {
      setUser(globalUser);
    } else {
      const loadUser = async () => {
        try {
          const stored = await AsyncStorage.getItem('kitpup_user');
          if (stored) setUser(JSON.parse(stored));
        } catch (e) {}
      };
      loadUser();
    }
  }, [globalUser]);

  useEffect(() => {
    fetchCart();
    const sub = DeviceEventEmitter.addListener('cartUpdated', fetchCart);
    return () => {
      if (sub) sub.remove();
    };
  }, [fetchCart]);

  const getInitials = (name) => {
    if (!name) return 'KP';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView className="bg-white">
      {/* Spacer for Android status bar if not using edge-to-edge correctly, but SafeAreaView helps */}
      <View className={`flex-row items-center justify-between px-4 h-14 bg-white border-b border-gray-100 ${Platform.OS === 'android' ? 'mt-8' : ''}`}>
        
        <View className="flex-row items-center flex-1">
          {back ? (
            <TouchableOpacity onPress={navigation.goBack} className="mr-3 p-1 rounded-full bg-gray-100">
              <ArrowLeft color="#374151" size={20} />
            </TouchableOpacity>
          ) : null}
          <Image source={require('../../assets/logo.png')} className="w-8 h-8 mr-2 rounded-lg" resizeMode="contain" />
          <Text className="text-xl font-bold text-gray-800" numberOfLines={1}>{title}</Text>
        </View>

        <View className="flex-row items-center ml-4">
          <TouchableOpacity 
            onPress={() => navigation.navigate('Cart')}
            className="relative p-2 mr-1 bg-gray-50 rounded-full"
          >
            <ShoppingCart color="#6b7280" size={20} />
            {cartCount > 0 && (
              <View className="absolute top-0 right-0 bg-red-500 rounded-full w-4 h-4 items-center justify-center border border-white">
                <Text className="text-white font-bold" style={{ fontSize: 9 }}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => Alert.alert('Notifications', 'You have no new notifications.')}
            className="relative p-2 mr-3 bg-gray-50 rounded-full"
          >
            <Bell color="#6b7280" size={20} />
            <View className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
          </TouchableOpacity>
          
          {user && (
            <TouchableOpacity 
              onPress={() => navigation.navigate('Profile')}
              className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shadow-sm overflow-hidden border border-orange-100"
            >
              {user.avatar && !user.avatar.includes('ui-avatars') ? (
                <Image source={{ uri: user.avatar }} className="w-full h-full" />
              ) : (
                <Text className="text-white font-bold text-xs">{getInitials(user.name)}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}
