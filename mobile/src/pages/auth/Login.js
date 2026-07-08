import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react-native';
import { API_URL } from '../../api/config';

export default function Login({ navigation, setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    
    if (email && password) {
      try {
        setLoading(true);
        // We will replace this with actual backend API URL
        const res = await axios.post(`${API_URL}/api/v1/users/login`, { email, password });
        if (res.data.success) {
          const { token, user } = res.data;
          setUser({ ...user, token });
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        <View className="mb-8 items-center">
          <View className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center mb-3 shadow-sm">
            <Text className="text-white font-bold text-2xl">K</Text>
          </View>
          <Text className="text-3xl font-bold text-orange-500">KitPup</Text>
        </View>

        <View className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-8 self-center">
          <Text className="text-2xl font-bold text-gray-800 mb-2">Welcome Back! 🐾</Text>
          <Text className="text-gray-500 mb-6">Log in to manage your pet's life</Text>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-bold text-gray-700 mb-1">Email Address</Text>
              <TextInput 
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800" 
                placeholder="jane.doe@example.com" 
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <View>
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-sm font-bold text-gray-700">Password</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text className="text-sm font-bold text-orange-500">Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <View className="relative">
                <TextInput 
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800 pr-12" 
                  placeholder="••••••••" 
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5"
                >
                  {showPassword ? (
                    <EyeOff color="#9ca3af" size={20} />
                  ) : (
                    <Eye color="#9ca3af" size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {error ? (
              <View className="bg-red-50 p-3 rounded-lg mt-2">
                <Text className="text-red-500 text-sm font-bold">{error}</Text>
              </View>
            ) : null}
            
            <TouchableOpacity 
              onPress={handleSubmit} 
              disabled={loading} 
              className={`w-full bg-orange-500 py-3.5 rounded-xl shadow-sm items-center mt-4 ${loading ? 'opacity-75' : ''}`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Log In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="mt-6 flex-row justify-center items-center">
            <Text className="text-gray-500 text-sm">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="font-bold text-orange-500 text-sm">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
