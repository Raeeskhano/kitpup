import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react-native';
import { API_URL } from '../../api/config';

export default function Register({ navigation, setUser }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    
    if (email && password && name) {
      try {
        setLoading(true);
        const res = await axios.post(`${API_URL}/api/v1/users/register`, { name, email, password });
        if (res.data.success) {
          const { token, user } = res.data;
          setUser({ ...user, token });
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        <View className="mb-6 items-center">
          <View className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center mb-3 shadow-sm">
            <Text className="text-white font-bold text-2xl">K</Text>
          </View>
          <Text className="text-3xl font-bold text-orange-500">KitPup</Text>
        </View>

        <View className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-8 self-center">
          <Text className="text-2xl font-bold text-gray-800 mb-2">Create Account</Text>
          <Text className="text-gray-500 mb-6">Join the KitPup community today</Text>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-bold text-gray-700 mb-1">Full Name</Text>
              <TextInput 
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800" 
                placeholder="Jane Doe" 
                placeholderTextColor="#9ca3af"
              />
            </View>

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
              <Text className="text-sm font-bold text-gray-700 mb-1">Password</Text>
              <View className="relative">
                <TextInput 
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800 pr-12" 
                  placeholder="Create a strong password" 
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
                <Text className="text-white font-bold text-base">Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="mt-6 flex-row justify-center items-center">
            <Text className="text-gray-500 text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="font-bold text-orange-500 text-sm">Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
