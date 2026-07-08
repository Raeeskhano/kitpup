import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Modal, ActivityIndicator, Alert, Linking, Platform, KeyboardAvoidingView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { X, Filter, MapPin, Clock, Phone, MessageCircle, Info } from 'lucide-react-native';
import { API_URL } from '../api/config';

function getRelativeTime(dateStr) {
  if (!dateStr) return 'Unknown time';
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function LostFound() {
  const [activeTab, setActiveTab] = useState('lost'); // 'lost' | 'found'
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', species: 'Dog', breed: '', location: '', lastSeenDate: '', description: ''
  });
  const [photoUri, setPhotoUri] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailPet, setDetailPet] = useState(null);

  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const init = async () => {
      const stored = await AsyncStorage.getItem('kitpup_user');
      if (stored) {
        setCurrentUserId(JSON.parse(stored).id);
      }
    };
    init();
  }, []);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem('kitpup_user');
      let token = stored ? JSON.parse(stored).token : '';
      
      const res = await axios.get(`${API_URL}/api/v1/pets?status=${activeTab}&limit=20`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setPets(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, [activeTab]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleReportSubmit = async () => {
    if (!formData.name || !formData.location) {
      Alert.alert('Error', 'Name and Location are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const stored = await AsyncStorage.getItem('kitpup_user');
      let token = stored ? JSON.parse(stored).token : '';

      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      data.append('status', 'lost');
      
      if (photoUri) {
        const filename = photoUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        data.append('photos', { uri: photoUri, name: filename, type });
      }

      await axios.post(`${API_URL}/api/v1/pets`, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setIsReportOpen(false);
      setFormData({ name: '', species: 'Dog', breed: '', location: '', lastSeenDate: '', description: '' });
      setPhotoUri(null);
      Alert.alert('Success', 'Alert posted! Community has been notified.');
      
      if (activeTab === 'lost') fetchPets();
      else setActiveTab('lost');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to report pet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotifyNearby = async (id) => {
    try {
      const stored = await AsyncStorage.getItem('kitpup_user');
      let token = stored ? JSON.parse(stored).token : '';
      await axios.post(`${API_URL}/api/v1/pets/${id}/notify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Success', 'Nearby users have been notified!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkStatus = async (id, status) => {
    try {
      const stored = await AsyncStorage.getItem('kitpup_user');
      let token = stored ? JSON.parse(stored).token : '';
      await axios.patch(`${API_URL}/api/v1/pets/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Success', `Pet marked as ${status}!`);
      setPets(prev => prev.filter(p => p._id !== id));
      if (isDetailModalOpen) setIsDetailModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="p-4 pt-8 border-b border-gray-100 bg-white">
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1 pr-4">
            <Text className="text-3xl font-bold text-gray-800 mb-1">Lost & Found</Text>
            <Text className="text-sm text-gray-500 font-medium">Help reunite pets with their families.</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setIsReportOpen(true)}
            className="bg-[#b92b27] px-4 py-2 rounded-xl flex-row items-center shadow-sm"
          >
            <Text className="text-white font-bold">Report</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row items-center border-b border-gray-100">
          <TouchableOpacity 
            onPress={() => setActiveTab('lost')}
            className={`mr-6 pb-3 border-b-2 ${activeTab === 'lost' ? 'border-[#9c5930]' : 'border-transparent'}`}
          >
            <Text className={`font-bold ${activeTab === 'lost' ? 'text-[#9c5930]' : 'text-gray-400'}`}>Active Alerts</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('found')}
            className={`pb-3 border-b-2 ${activeTab === 'found' ? 'border-[#9c5930]' : 'border-transparent'}`}
          >
            <Text className={`font-bold ${activeTab === 'found' ? 'text-[#9c5930]' : 'text-gray-400'}`}>Found Pets</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-4 bg-gray-50">
        {loading ? (
          <View className="flex-row flex-wrap justify-between">
            {[...Array(4)].map((_, i) => (
              <View key={i} className="w-[48%] h-[280px] bg-gray-200 rounded-3xl mb-4 animate-pulse" />
            ))}
          </View>
        ) : pets.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Text className="text-4xl mb-4">🐾</Text>
            <Text className="text-lg font-bold text-gray-800">No active alerts</Text>
            <Text className="text-gray-500">No active alerts in your area.</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between pb-10">
            {pets.map(pet => (
              <TouchableOpacity 
                key={pet._id}
                onPress={() => { setDetailPet(pet); setIsDetailModalOpen(true); }}
                className="w-[48%] bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-4"
              >
                <View className="h-32 bg-gray-100 relative">
                  {pet.photos && pet.photos.length > 0 ? (
                    <Image source={{ uri: pet.photos[0] }} className="w-full h-full object-cover" />
                  ) : (
                    <View className="flex-1 items-center justify-center"><Text className="text-gray-500 font-medium text-xs">No Image</Text></View>
                  )}
                  <View className={`absolute top-2 right-2 px-2 py-1 rounded-full ${activeTab === 'lost' ? 'bg-[#b92b27]' : 'bg-green-600'}`}>
                    <Text className="text-white text-[10px] font-bold">{pet.status.toUpperCase()}</Text>
                  </View>
                  <View className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded-lg flex-row items-center">
                    <Clock color="#9ca3af" size={10} className="mr-1" />
                    <Text className="text-[10px] font-bold text-gray-700">{getRelativeTime(pet.lastSeenDate || pet.createdAt)}</Text>
                  </View>
                </View>

                <View className="p-3">
                  <Text className="font-bold text-gray-800 text-base" numberOfLines={1}>{pet.name}</Text>
                  <Text className="text-xs text-gray-500 mb-1" numberOfLines={1}>{pet.breed}</Text>
                  <View className="flex-row items-center mb-3">
                    <MapPin color="#9ca3af" size={12} className="mr-1" />
                    <Text className="text-[10px] text-gray-500 flex-1" numberOfLines={1}>{pet.location || 'Unknown'}</Text>
                  </View>

                  {/* Buttons */}
                  {activeTab === 'lost' ? (
                    <View className="flex-row gap-2">
                      <TouchableOpacity 
                        onPress={(e) => { e.stopPropagation(); handleNotifyNearby(pet._id); }}
                        className="flex-1 bg-orange-50 py-2 rounded-xl items-center"
                      >
                        <Text className="text-orange-500 text-xs font-bold">Notify</Text>
                      </TouchableOpacity>
                      {(pet.owner && pet.owner._id === currentUserId) ? (
                        <TouchableOpacity 
                          onPress={(e) => { e.stopPropagation(); handleMarkStatus(pet._id, 'found'); }}
                          className="flex-1 bg-green-50 py-2 rounded-xl items-center"
                        >
                          <Text className="text-green-600 text-xs font-bold">Found</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity 
                          onPress={(e) => { e.stopPropagation(); setSelectedPet(pet); setIsContactModalOpen(true); }}
                          className="flex-1 bg-blue-50 py-2 rounded-xl items-center"
                        >
                          <Text className="text-blue-600 text-xs font-bold">Contact</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    (pet.owner && pet.owner._id === currentUserId) && (
                      <TouchableOpacity 
                        onPress={(e) => { e.stopPropagation(); handleMarkStatus(pet._id, 'reunited'); }}
                        className="w-full bg-green-50 py-2 rounded-xl items-center"
                      >
                        <Text className="text-green-600 text-xs font-bold">Mark Reunited</Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Report Modal */}
      <Modal visible={isReportOpen} animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-4 pt-12 border-b border-gray-100">
            <Text className="text-xl font-bold text-gray-800">Report Lost Pet</Text>
            <TouchableOpacity onPress={() => setIsReportOpen(false)}><X color="gray" size={24} /></TouchableOpacity>
          </View>
          <ScrollView className="flex-1 p-4">
            <Text className="text-sm font-bold text-gray-700 mb-1 mt-2">Pet Name</Text>
            <TextInput value={formData.name} onChangeText={t => setFormData({...formData, name: t})} className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4" />

            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-700 mb-1">Species</Text>
                <TextInput value={formData.species} onChangeText={t => setFormData({...formData, species: t})} className="w-full border border-gray-200 rounded-xl px-4 py-3" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-700 mb-1">Breed</Text>
                <TextInput value={formData.breed} onChangeText={t => setFormData({...formData, breed: t})} className="w-full border border-gray-200 rounded-xl px-4 py-3" />
              </View>
            </View>

            <Text className="text-sm font-bold text-gray-700 mb-1">Last Seen Location</Text>
            <TextInput value={formData.location} onChangeText={t => setFormData({...formData, location: t})} className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4" />

            <Text className="text-sm font-bold text-gray-700 mb-1">Last Seen Date & Time (YYYY-MM-DD HH:MM)</Text>
            <TextInput value={formData.lastSeenDate} onChangeText={t => setFormData({...formData, lastSeenDate: t})} className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4" />

            <Text className="text-sm font-bold text-gray-700 mb-1">Description</Text>
            <TextInput multiline numberOfLines={3} value={formData.description} onChangeText={t => setFormData({...formData, description: t})} className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 text-top" textAlignVertical="top" />

            <Text className="text-sm font-bold text-gray-700 mb-1">Upload Photo</Text>
            <TouchableOpacity onPress={pickImage} className="w-full border border-gray-200 rounded-xl p-4 mb-6 items-center bg-gray-50">
              {photoUri ? <Image source={{uri: photoUri}} className="w-20 h-20 rounded-lg" /> : <Text className="text-orange-500 font-bold">Pick Image</Text>}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleReportSubmit} 
              disabled={isSubmitting}
              className="w-full bg-[#b92b27] py-4 rounded-xl items-center mb-10"
            >
              <Text className="text-white font-bold text-lg">{isSubmitting ? 'Posting...' : 'Post Alert'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Detail Modal */}
      <Modal visible={isDetailModalOpen} animationType="slide">
        {detailPet && (
          <View className="flex-1 bg-white">
            <ScrollView className="flex-1">
              <View className="h-[40vh] bg-gray-100 relative">
                {detailPet.photos && detailPet.photos.length > 0 ? (
                  <Image source={{ uri: detailPet.photos[0] }} className="w-full h-full object-cover" />
                ) : (
                  <View className="flex-1 items-center justify-center"><Text className="text-gray-500 font-medium">No Image</Text></View>
                )}
                <TouchableOpacity 
                  onPress={() => setIsDetailModalOpen(false)}
                  className="absolute top-12 right-4 bg-white/80 p-2 rounded-full"
                >
                  <X color="black" size={24} />
                </TouchableOpacity>
              </View>

              <View className="p-6">
                <Text className="text-4xl font-black text-gray-800 mb-2">{detailPet.name}</Text>
                <View className="flex-row items-center mb-6">
                  <MapPin color="#f97316" size={16} className="mr-1" />
                  <Text className="text-gray-500 font-bold text-sm">{detailPet.location}</Text>
                </View>

                <View className="flex-row flex-wrap gap-2 mb-6">
                  <View className="bg-gray-100 px-3 py-1.5 rounded-full"><Text className="text-gray-600 font-medium text-sm">{detailPet.species}</Text></View>
                  <View className="bg-gray-100 px-3 py-1.5 rounded-full"><Text className="text-gray-600 font-medium text-sm">{detailPet.breed}</Text></View>
                </View>

                <Text className="text-lg font-bold text-gray-800 mb-2">Description</Text>
                <View className="bg-gray-50 p-4 rounded-2xl mb-8">
                  <Text className="text-gray-600 leading-relaxed">{detailPet.description || 'No description provided.'}</Text>
                </View>
              </View>
            </ScrollView>

            <View className="p-4 border-t border-gray-100">
              <TouchableOpacity 
                onPress={() => setIsDetailModalOpen(false)}
                className="w-full bg-gray-100 py-4 rounded-xl items-center"
              >
                <Text className="font-bold text-gray-800">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      {/* Contact Modal */}
      <Modal visible={isContactModalOpen} transparent={true} animationType="fade">
        {selectedPet && (
          <View className="flex-1 bg-black/50 justify-center p-4">
            <View className="bg-white rounded-3xl p-6 relative">
              <TouchableOpacity onPress={() => setIsContactModalOpen(false)} className="absolute top-4 right-4">
                <X color="gray" size={24} />
              </TouchableOpacity>
              
              <Text className="text-xl font-bold mb-6">Contact Owner</Text>
              
              {selectedPet.owner?.contactNumber && (
                <TouchableOpacity 
                  onPress={() => Linking.openURL(`tel:${selectedPet.owner.contactNumber}`)}
                  className="flex-row items-center p-4 bg-gray-50 rounded-xl mb-3"
                >
                  <Phone color="black" size={20} className="mr-3" />
                  <Text className="font-bold">{selectedPet.owner.contactNumber}</Text>
                </TouchableOpacity>
              )}
              
              {selectedPet.owner?.whatsappNumber && (
                <TouchableOpacity 
                  onPress={() => Linking.openURL(`https://wa.me/${selectedPet.owner.whatsappNumber.replace(/\D/g, '')}`)}
                  className="flex-row items-center p-4 bg-[#25D366] rounded-xl mb-3"
                >
                  <MessageCircle color="white" size={20} className="mr-3" />
                  <Text className="font-bold text-white">{selectedPet.owner.whatsappNumber}</Text>
                </TouchableOpacity>
              )}
              
              {(!selectedPet.owner?.contactNumber && !selectedPet.owner?.whatsappNumber) && (
                <Text className="text-gray-500 text-center py-4">No contact info available.</Text>
              )}
            </View>
          </View>
        )}
      </Modal>

    </View>
  );
}
