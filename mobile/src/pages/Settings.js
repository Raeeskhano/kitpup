import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, Modal, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronRight, X } from 'lucide-react-native';
import { API_URL } from '../api/config';

export default function Settings({ setUser: setGlobalUser }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [activeModal, setActiveModal] = useState(null);
  
  const [emailInput, setEmailInput] = useState('');
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [measureSystem, setMeasureSystem] = useState('Imperial');
  const [contactInputs, setContactInputs] = useState({ contactNumber: '', whatsappNumber: '' });
  
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const getToken = async () => {
    const stored = await AsyncStorage.getItem('kitpup_user');
    return stored ? JSON.parse(stored).token : '';
  };

  const fetchUser = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API_URL}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.data);
      setMeasureSystem(res.data.data.preferences?.measurementSystem || 'Imperial');
      setEmailInput(res.data.data.email);
      setContactInputs({
        contactNumber: res.data.data.contactNumber || '',
        whatsappNumber: res.data.data.whatsappNumber || ''
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleToggle = async (type) => {
    if (!user) return;
    
    const currentVal = user.notifications?.[type] ?? (type === 'push');
    const newNotifications = { ...user.notifications, [type]: !currentVal };
    
    setUser({ ...user, notifications: newNotifications });

    try {
      const token = await getToken();
      await axios.patch(`${API_URL}/api/v1/users/me`, 
        { notifications: newNotifications },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      setUser({ ...user, notifications: { ...user.notifications, [type]: currentVal } });
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  const handleSave = async (payload, successMsg) => {
    setError('');
    setIsSaving(true);
    try {
      const token = await getToken();
      const res = await axios.patch(`${API_URL}/api/v1/users/me`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.data);
      setActiveModal(null);
      Alert.alert('Success', successMsg);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update settings');
    }
    setIsSaving(false);
  };

  const handleSavePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    try {
      setIsSaving(true);
      const token = await getToken();
      const res = await axios.patch(`${API_URL}/api/v1/users/me/password`, {
        currentPassword: passwords.current,
        newPassword: passwords.new
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const stored = await AsyncStorage.getItem('kitpup_user');
      if (stored) {
        const u = JSON.parse(stored);
        u.token = res.data.token;
        await AsyncStorage.setItem('kitpup_user', JSON.stringify(u));
      }
      
      setActiveModal(null);
      setPasswords({ current: '', new: '', confirm: '' });
      Alert.alert('Success', 'Password updated successfully!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('kitpup_user');
    setGlobalUser(null);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4 pt-8">
        <Text className="text-3xl font-bold text-gray-800 mb-2">Settings</Text>
        <Text className="text-gray-500 font-medium mb-6">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</Text>

        <View className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Account */}
          <View className="p-6 border-b border-gray-100">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Account</Text>
            
            <TouchableOpacity onPress={() => setActiveModal('email')} className="flex-row items-center justify-between mb-5">
              <View>
                <Text className="font-bold text-gray-800 text-sm">Email Address</Text>
                <Text className="text-sm text-gray-500">{user?.email}</Text>
              </View>
              <ChevronRight color="#9ca3af" size={20} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setActiveModal('password')} className="flex-row items-center justify-between">
              <View>
                <Text className="font-bold text-gray-800 text-sm">Password</Text>
                <Text className="text-sm text-gray-500 tracking-widest">••••••••</Text>
              </View>
              <ChevronRight color="#9ca3af" size={20} />
            </TouchableOpacity>
          </View>

          {/* Notifications */}
          <View className="p-6 border-b border-gray-100">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Notifications</Text>
            
            <View className="flex-row items-center justify-between mb-5">
              <View className="flex-1 pr-4">
                <Text className="font-bold text-gray-800 text-sm">Push Notifications</Text>
                <Text className="text-xs text-gray-500 mt-1">Receive alerts for reminders and messages</Text>
              </View>
              <Switch 
                value={user?.notifications?.push ?? true}
                onValueChange={() => handleToggle('push')}
                trackColor={{ false: "#e5e7eb", true: "#f97316" }}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="font-bold text-gray-800 text-sm">Email Updates</Text>
                <Text className="text-xs text-gray-500 mt-1">Weekly pet care tips and product updates</Text>
              </View>
              <Switch 
                value={user?.notifications?.email ?? false}
                onValueChange={() => handleToggle('email')}
                trackColor={{ false: "#e5e7eb", true: "#f97316" }}
              />
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity onPress={handleLogout} className="p-4 bg-red-50 items-center justify-center">
            <Text className="text-red-600 font-bold">Log Out</Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* Edit Email Modal */}
      <Modal visible={activeModal === 'email'} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/40 p-4">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Edit Email</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X color="gray" size={24} />
              </TouchableOpacity>
            </View>
            
            <View className="space-y-4">
              <View>
                <Text className="text-xs font-bold text-gray-600 mb-1">EMAIL ADDRESS</Text>
                <TextInput 
                  value={emailInput}
                  onChangeText={setEmailInput}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base"
                />
              </View>
              <TouchableOpacity 
                onPress={() => handleSave({ email: emailInput }, 'Email updated')}
                className="w-full bg-orange-500 py-4 rounded-xl mt-4 items-center"
              >
                <Text className="text-white font-bold">Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Password Modal */}
      <Modal visible={activeModal === 'password'} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/40 p-4">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Change Password</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X color="gray" size={24} />
              </TouchableOpacity>
            </View>
            
            <View className="space-y-4">
              <View>
                <Text className="text-xs font-bold text-gray-600 mb-1">CURRENT PASSWORD</Text>
                <TextInput 
                  secureTextEntry
                  value={passwords.current}
                  onChangeText={(t) => setPasswords({...passwords, current: t})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base"
                />
              </View>
              <View>
                <Text className="text-xs font-bold text-gray-600 mb-1">NEW PASSWORD</Text>
                <TextInput 
                  secureTextEntry
                  value={passwords.new}
                  onChangeText={(t) => setPasswords({...passwords, new: t})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base"
                />
              </View>
              <View>
                <Text className="text-xs font-bold text-gray-600 mb-1">CONFIRM NEW PASSWORD</Text>
                <TextInput 
                  secureTextEntry
                  value={passwords.confirm}
                  onChangeText={(t) => setPasswords({...passwords, confirm: t})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base"
                />
              </View>
              <TouchableOpacity 
                onPress={handleSavePassword}
                disabled={isSaving}
                className={`w-full bg-orange-500 py-4 rounded-xl mt-4 items-center ${isSaving ? 'opacity-70' : ''}`}
              >
                {isSaving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Update Password</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}
