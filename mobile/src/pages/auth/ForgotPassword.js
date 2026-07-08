import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { CheckCircle } from 'lucide-react-native';

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 justify-center items-center p-4">
      <View className="mb-6 items-center">
        <View className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center mb-3 shadow-sm">
          <Text className="text-white font-bold text-2xl">K</Text>
        </View>
        <Text className="text-3xl font-bold text-orange-500">KitPup</Text>
      </View>

      <View className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Reset Password</Text>
        
        {submitted ? (
          <View className="items-center py-4">
            <View className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle color="#22c55e" size={32} />
            </View>
            <Text className="font-bold text-gray-800 text-lg mb-2 text-center">Check your email</Text>
            <Text className="text-gray-500 mb-6 text-center">We've sent a password reset link to {email}</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')} 
              className="w-full bg-orange-500 py-3.5 rounded-xl shadow-sm items-center"
            >
              <Text className="text-white font-bold text-base">Return to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text className="text-gray-500 mb-6">Enter your email and we'll send you a link to reset your password.</Text>
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

              <TouchableOpacity 
                onPress={handleSubmit} 
                className="w-full bg-orange-500 py-3.5 rounded-xl shadow-sm items-center mt-2"
              >
                <Text className="text-white font-bold text-base">Send Reset Link</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')} 
              className="w-full mt-4 py-3.5 rounded-xl border border-gray-200 items-center"
            >
              <Text className="text-gray-500 font-bold text-base">Back to Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
