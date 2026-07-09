import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Modal, ActivityIndicator, Alert, Dimensions, Linking } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Search, Heart, X, Plus, Filter, Phone, MessageCircle } from 'lucide-react-native';
import { API_URL } from '../api/config';

const { width } = Dimensions.get('window');

export default function Marketplace() {
  const [species, setSpecies] = useState('Dog');
  const [search, setSearch] = useState('');
  
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [favorites, setFavorites] = useState([]);

  // Modal State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterBreed, setFilterBreed] = useState('');
  
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const storedUser = await AsyncStorage.getItem('kitpup_user');
      let token = storedUser ? JSON.parse(storedUser).token : '';

      let url = `${API_URL}/api/v1/pets?species=${species}`;
      if (search) url += `&search=${search}`;
      if (filterBreed) url += `&breed=${filterBreed}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPets(res.data.data);
    } catch (err) {
      console.error('Could not load companions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPets();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [species, search, filterBreed]);

  const handleFavorite = async (id) => {
    try {
      const storedUser = await AsyncStorage.getItem('kitpup_user');
      let token = storedUser ? JSON.parse(storedUser).token : '';

      const res = await axios.patch(`${API_URL}/api/v1/pets/${id}/favorite`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(res.data.favorites);
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const isFav = (id) => favorites.includes(id);

  const openWhatsApp = (number) => {
    if (!number) return;
    const cleanNumber = number.replace(/[^0-9]/g, '');
    Linking.openURL(`https://wa.me/${cleanNumber}`);
  };

  const openPhone = (number) => {
    if (!number) return;
    Linking.openURL(`tel:${number}`);
  };

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 pt-8 bg-white z-10 shadow-sm border-b border-gray-100">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-3xl font-bold text-gray-800">Companions</Text>
          <TouchableOpacity onPress={() => setIsFilterOpen(true)} className="p-2 bg-orange-50 rounded-full">
            <Filter color="#f97316" size={20} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-orange-50/50 border border-orange-100 rounded-xl px-4 py-2 mb-4">
          <Search color="#9ca3af" size={20} />
          <TextInput 
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name..."
            className="flex-1 ml-2 text-gray-800 text-base"
          />
        </View>

        {/* Species Tabs */}
        <View className="flex-row bg-orange-50/50 p-1 rounded-xl border border-orange-100">
          <TouchableOpacity 
            onPress={() => setSpecies('Dog')}
            className={`flex-1 py-2 items-center rounded-lg ${species === 'Dog' ? 'bg-orange-500 shadow-sm' : 'bg-transparent'}`}
          >
            <Text className={`font-bold ${species === 'Dog' ? 'text-white' : 'text-gray-500'}`}>Dog</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setSpecies('Cat')}
            className={`flex-1 py-2 items-center rounded-lg ${species === 'Cat' ? 'bg-orange-500 shadow-sm' : 'bg-transparent'}`}
          >
            <Text className={`font-bold ${species === 'Cat' ? 'text-white' : 'text-gray-500'}`}>Cat</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-4 bg-gray-50">
        <Text className="font-bold text-gray-500 mb-4">{pets.length} companions found</Text>

        {loading ? (
          <View className="flex-row flex-wrap justify-between">
            {[...Array(4)].map((_, i) => (
              <View key={i} className="w-[48%] bg-gray-200 h-64 rounded-3xl mb-4 animate-pulse" />
            ))}
          </View>
        ) : pets.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <Text className="text-gray-400 font-bold text-lg">No companions found.</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between pb-10">
            {pets.map(pet => (
              <TouchableOpacity 
                key={pet._id} 
                onPress={() => { setSelectedPet(pet); setIsDetailsModalOpen(true); }}
                className="w-[48%] bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-4"
              >
                <View className="h-40 bg-gray-100 relative">
                  {pet.photos && pet.photos.length > 0 ? (
                    <Image source={{ uri: pet.photos[0] }} className="w-full h-full" />
                  ) : (
                    <View className="flex-1 items-center justify-center"><Text className="text-gray-500 font-medium">No Image</Text></View>
                  )}
                  <TouchableOpacity 
                    onPress={() => handleFavorite(pet._id)}
                    className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full"
                  >
                    <Heart size={16} color={isFav(pet._id) ? "#ef4444" : "#9ca3af"} fill={isFav(pet._id) ? "#ef4444" : "transparent"} />
                  </TouchableOpacity>
                  {pet.status === 'active' && (
                    <View className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded-full flex-row items-center">
                      <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1" />
                      <Text className="text-green-600 text-[10px] font-bold">Available</Text>
                    </View>
                  )}
                </View>
                <View className="p-3">
                  <Text className="font-bold text-gray-800 text-base" numberOfLines={1}>{pet.name}</Text>
                  <Text className="font-bold text-[#92400E] text-sm mb-1">{pet.fee === 0 ? 'Free' : `PKR ${pet.fee}`}</Text>
                  <Text className="text-xs text-gray-500 mb-2" numberOfLines={1}>{pet.breed}</Text>
                  
                  <View className="bg-orange-50 rounded-xl py-2 items-center">
                    <Text className="text-orange-500 text-xs font-bold">View Details</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Details Modal */}
      <Modal visible={isDetailsModalOpen} animationType="slide">
        {selectedPet && (
          <View className="flex-1 bg-white">
            <ScrollView className="flex-1">
              <View className="h-[40vh] relative bg-gray-100">
                {selectedPet.photos && selectedPet.photos.length > 0 ? (
                  <Image source={{ uri: selectedPet.photos[0] }} className="w-full h-full" />
                ) : (
                  <View className="flex-1 items-center justify-center"><Text className="text-gray-500 font-medium">No Image</Text></View>
                )}
                <TouchableOpacity 
                  onPress={() => setIsDetailsModalOpen(false)}
                  className="absolute top-12 right-4 bg-white/80 p-2 rounded-full shadow-sm"
                >
                  <X color="black" size={24} />
                </TouchableOpacity>
              </View>

              <View className="p-6">
                <Text className="text-4xl font-black text-gray-800 mb-1">{selectedPet.name}</Text>
                <Text className="text-2xl font-black text-[#92400E] mb-6">{selectedPet.fee === 0 ? 'Free' : `PKR ${selectedPet.fee}`}</Text>

                <View className="flex-row flex-wrap gap-2 mb-6">
                  <View className="bg-orange-50 px-3 py-1.5 rounded-full"><Text className="text-orange-500 font-bold text-sm">{selectedPet.species}</Text></View>
                  <View className="bg-gray-100 px-3 py-1.5 rounded-full"><Text className="text-gray-600 font-medium text-sm">{selectedPet.breed}</Text></View>
                  <View className="bg-gray-100 px-3 py-1.5 rounded-full"><Text className="text-gray-600 font-medium text-sm">{selectedPet.age}</Text></View>
                  <View className="bg-gray-100 px-3 py-1.5 rounded-full"><Text className="text-gray-600 font-medium text-sm">{selectedPet.gender}</Text></View>
                </View>

                <Text className="text-lg font-bold text-gray-800 mb-2">Description</Text>
                <View className="bg-gray-50 p-4 rounded-2xl mb-4">
                  <Text className="text-gray-600 leading-relaxed">{selectedPet.description || 'No description provided.'}</Text>
                </View>
                <Text className="text-gray-500 font-medium mb-8">Location: {selectedPet.location}</Text>
              </View>
            </ScrollView>

            {/* Contact Bottom Bar */}
            <View className="p-4 bg-white border-t border-gray-100 flex-row gap-4">
              <TouchableOpacity 
                onPress={() => openPhone(selectedPet.contactNumber || selectedPet.owner?.contactNumber)}
                disabled={!(selectedPet.contactNumber || selectedPet.owner?.contactNumber)}
                className="flex-1 flex-row items-center justify-center py-4 bg-gray-100 rounded-xl"
              >
                <Phone color="black" size={20} className="mr-2" />
                <Text className="font-bold text-black">Call Seller</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => openWhatsApp(selectedPet.whatsappNumber || selectedPet.owner?.whatsappNumber)}
                disabled={!(selectedPet.whatsappNumber || selectedPet.owner?.whatsappNumber)}
                className="flex-1 flex-row items-center justify-center py-4 bg-[#25D366] rounded-xl"
              >
                <MessageCircle color="white" size={20} className="mr-2" />
                <Text className="font-bold text-white">WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      {/* Filter Modal */}
      <Modal visible={isFilterOpen} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white p-6 rounded-t-3xl min-h-[40%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Filter By Breed</Text>
              <TouchableOpacity onPress={() => setIsFilterOpen(false)}><X color="gray" size={24} /></TouchableOpacity>
            </View>
            <View>
              <Text className="text-sm font-bold text-gray-700 mb-1">Breed Name</Text>
              <TextInput 
                value={filterBreed}
                onChangeText={setFilterBreed}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800" 
                placeholder="e.g. Golden Retriever" 
                placeholderTextColor="#6b7280"
              />
            </View>
            <TouchableOpacity 
              onPress={() => setIsFilterOpen(false)}
              className="w-full bg-orange-500 py-3.5 rounded-xl shadow-sm items-center mt-6"
            >
              <Text className="text-white font-bold text-base">Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
