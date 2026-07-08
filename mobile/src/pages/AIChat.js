import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../api/config';
import { Send, Image as ImageIcon, X } from 'lucide-react-native';

const SYSTEM_PROMPT = `You are KitPup AI, a veterinary assistant. CRITICAL RULE: Your ENTIRE response MUST be clear, concise, and to the point. You must NEVER exceed 2 to 3 sentences in length. When a user describes pet symptoms, you must immediately provide a short, concise response outlining: 1) the likely causes, 2) the recommended treatment, and 3) specific medicine/remedies. Do not use long introductions. When location is available and the user needs a vet, include a JSON block at the end of your response: {"clinics":[{"name":"Clinic Name","distance":"1.2 miles away","open":true}]}`;

export default function AIChat({ navigation }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm KitPup AI. How can I help you and your furry friend today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  
  const scrollViewRef = useRef();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true, // Need base64 for API
    });
    if (!result.canceled) {
      setAttachment({
        data: result.assets[0].base64,
        mimeType: result.assets[0].type === 'image' ? 'image/jpeg' : result.assets[0].type,
        previewUrl: result.assets[0].uri
      });
    }
  };

  const sendMessage = async (userText) => {
    if ((!userText.trim() && !attachment) || isLoading) return;
    
    const newMsg = { id: Date.now(), text: userText, isBot: false, attachment };
    const updatedMessages = [...messages, newMsg];
    
    setMessages(updatedMessages);
    setInput('');
    setAttachment(null);
    setIsLoading(true);

    try {
      const apiMessages = updatedMessages
        .filter(m => m.id !== 1)
        .slice(-10)
        .map(m => ({
          role: m.isBot ? 'assistant' : 'user',
          content: m.text,
          attachment: m.attachment ? { data: m.attachment.data, mimeType: m.attachment.mimeType } : null
        }));

      const storedUser = await AsyncStorage.getItem('kitpup_user');
      let token = storedUser ? JSON.parse(storedUser).token : '';
      
      const res = await axios.post(`${API_URL}/api/v1/ai/chat`, { 
        messages: apiMessages, 
        systemPrompt: SYSTEM_PROMPT 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.success) {
        setMessages([...updatedMessages, { id: Date.now(), text: res.data.data, isBot: true }]);
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      console.error('API Error:', err);
      setMessages([...updatedMessages, { 
        id: Date.now(), 
        text: "I'm having trouble connecting to my brain right now. Please try again later.", 
        isBot: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageText = (text) => {
    const jsonRegex = /({[\s\S]*"clinics"\s*:[\s\S]*})/;
    const match = text.match(jsonRegex);
    let displayText = text;
    let clinicsData = null;

    if (match) {
      try {
        clinicsData = JSON.parse(match[0]);
        displayText = text.replace(match[0], '').trim();
      } catch (e) {}
    }

    return (
      <View>
        <Text className="text-[15px] leading-relaxed text-gray-800">{displayText}</Text>
        {clinicsData?.clinics?.length > 0 && (
          <View className="mt-4 pt-4 border-t border-gray-200">
            {clinicsData.clinics.map((clinic, idx) => (
              <View key={idx} className="bg-orange-50 p-3 rounded-xl mb-2">
                <View className="flex-row justify-between mb-1">
                  <Text className="font-bold text-gray-800">{clinic.name}</Text>
                  {clinic.open && (
                    <View className="bg-green-100 px-2 py-0.5 rounded flex-row items-center">
                      <View className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1" />
                      <Text className="text-[10px] text-green-700 font-bold uppercase">Open</Text>
                    </View>
                  )}
                </View>
                <Text className="text-xs text-gray-500 mb-2">{clinic.distance}</Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Maps')}
                  className="bg-[#92400E] py-2 rounded-lg items-center"
                >
                  <Text className="text-white text-xs font-bold">Details</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View className="items-center justify-center pt-8 pb-4 border-b border-gray-100">
        <View className="w-12 h-12 rounded-full bg-[#92400E] items-center justify-center mb-2">
          <Text className="text-2xl">🐶</Text>
        </View>
        <Text className="text-lg font-bold text-gray-800">KitPup AI</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 bg-gray-50 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {messages.map((msg) => (
          <View key={msg.id} className={`flex-row mb-4 max-w-[85%] ${msg.isBot ? 'self-start' : 'self-end'}`}>
            {msg.isBot && (
              <View className="w-8 h-8 rounded-full bg-[#92400E] items-center justify-center mr-2">
                <Text className="text-white text-xs">AI</Text>
              </View>
            )}
            
            <View className={`p-4 rounded-2xl ${msg.isBot ? 'bg-white border border-gray-200 rounded-tl-sm' : 'bg-[#92400E] rounded-tr-sm'}`}>
              {msg.attachment?.previewUrl && (
                <Image source={{ uri: msg.attachment.previewUrl }} className="w-48 h-48 rounded-lg mb-2" />
              )}
              {msg.isBot ? (
                renderMessageText(msg.text)
              ) : (
                <Text className="text-[15px] leading-relaxed text-white">{msg.text}</Text>
              )}
            </View>
          </View>
        ))}
        {isLoading && (
          <View className="flex-row self-start items-center mb-4">
            <View className="w-8 h-8 rounded-full bg-[#92400E] items-center justify-center mr-2">
              <Text className="text-white text-xs">AI</Text>
            </View>
            <View className="bg-white p-4 rounded-2xl border border-gray-200 rounded-tl-sm">
              <ActivityIndicator color="#92400E" size="small" />
            </View>
          </View>
        )}
      </ScrollView>

      <View className="p-4 bg-white border-t border-gray-100">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          <TouchableOpacity 
            onPress={() => sendMessage("My pet is showing some symptoms. Can you help me figure out what might be wrong?")}
            className="bg-gray-100 px-3 py-1.5 rounded-full mr-2"
          >
            <Text className="text-xs text-gray-600 font-bold">🔍 Check symptoms</Text>
          </TouchableOpacity>
        </ScrollView>

        {attachment && (
          <View className="relative w-16 h-16 mb-2">
            <Image source={{ uri: attachment.previewUrl }} className="w-full h-full rounded-xl" />
            <TouchableOpacity 
              onPress={() => setAttachment(null)}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 border border-gray-200"
            >
              <X size={12} color="red" />
            </TouchableOpacity>
          </View>
        )}

        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={pickImage} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
            <ImageIcon size={20} color="gray" />
          </TouchableOpacity>
          <TextInput 
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-3"
          />
          <TouchableOpacity 
            onPress={() => sendMessage(input)}
            disabled={(!input.trim() && !attachment) || isLoading}
            className={`w-10 h-10 rounded-full items-center justify-center ${(!input.trim() && !attachment) || isLoading ? 'bg-orange-300' : 'bg-orange-500'}`}
          >
            <Send size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
