import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform, Image } from 'react-native';
import { Bell, ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TopBar({ title, back, navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem('kitpup_user');
        if (stored) setUser(JSON.parse(stored));
      } catch (e) {}
    };
    loadUser();
  }, []);

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
          <TouchableOpacity className="relative p-2 mr-3 bg-gray-50 rounded-full">
            <Bell color="#6b7280" size={20} />
            <View className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
          </TouchableOpacity>
          
          {user && (
            <TouchableOpacity 
              onPress={() => navigation.navigate('Profile')}
              className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shadow-sm"
            >
              <Text className="text-white font-bold text-xs">{getInitials(user.name)}</Text>
            </TouchableOpacity>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}
