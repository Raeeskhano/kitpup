import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, TextInput, ActivityIndicator, Alert, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../api/config';
import { X, Plus, Image as ImageIcon, Box, Heart, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react-native';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [products, setProducts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'profile', 'pet', 'product'
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState('');

  // Profile Form state
  const [editName, setEditName] = useState('');
  const [avatarUri, setAvatarUri] = useState(null);

  // Product Form state
  const [productForm, setProductForm] = useState({
    name: '', category: 'Food & Treats', price: '', stock: '', description: ''
  });
  const [productPhotoUri, setProductPhotoUri] = useState(null);

  // Pet Form state
  const [petForm, setPetForm] = useState({
    name: '', species: 'Dog', breed: '', age: '', gender: 'Male', weight: '',
    vaccinationStatus: false, location: '', status: 'personal', fee: '',
    contactNumber: '', whatsappNumber: '', description: ''
  });
  const [petPhotoUri, setPetPhotoUri] = useState(null);

  const getToken = async () => {
    const storedUser = await AsyncStorage.getItem('kitpup_user');
    return storedUser ? JSON.parse(storedUser).token : '';
  };

  const fetchData = async () => {
    try {
      const token = await getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [userRes, petsRes, actRes, productsRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/users/me`, config),
        axios.get(`${API_URL}/api/v1/pets/my`, config),
        axios.get(`${API_URL}/api/v1/users/me/activity?limit=3`, config),
        axios.get(`${API_URL}/api/v1/products/my`, config)
      ]);

      setUser(userRes.data.data);
      setEditName(userRes.data.data.name);
      
      setPets(petsRes.data.data || []);
      setProducts(productsRes.data.data || []);
      setActivities(actRes.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load profile', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pickImage = async (setter) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setter(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    setError('');
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('name', editName);
      
      if (avatarUri) {
        const filename = avatarUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('avatar', { uri: avatarUri, name: filename, type });
      }

      const res = await axios.patch(`${API_URL}/api/v1/users/me`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUser(res.data.data);
      
      const stored = await AsyncStorage.getItem('kitpup_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.name = res.data.data.name;
        parsed.avatar = res.data.data.avatar;
        await AsyncStorage.setItem('kitpup_user', JSON.stringify(parsed));
      }

      setActiveModal(null);
      Alert.alert('Success', 'Profile updated!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const handleSavePet = async () => {
    try {
      const token = await getToken();
      const formData = new FormData();
      Object.keys(petForm).forEach(key => formData.append(key, petForm[key]));
      
      if (petPhotoUri) {
        const filename = petPhotoUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('photos', { uri: petPhotoUri, name: filename, type });
      }

      const res = await axios.post(`${API_URL}/api/v1/pets`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      
      setPets([res.data.data, ...pets]);
      setActiveModal(null);
      setPetForm({ name: '', species: 'Dog', breed: '', age: '', gender: 'Male', weight: '', vaccinationStatus: false, location: '', status: 'personal', fee: '', contactNumber: '', whatsappNumber: '', description: '' });
      setPetPhotoUri(null);
      Alert.alert('Success', 'Pet added!');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to add pet');
    }
  };

  const handleSaveProduct = async () => {
    try {
      const token = await getToken();
      const formData = new FormData();
      Object.keys(productForm).forEach(key => formData.append(key, productForm[key]));
      
      if (productPhotoUri) {
        const filename = productPhotoUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('photos', { uri: productPhotoUri, name: filename, type });
      }

      const res = await axios.post(`${API_URL}/api/v1/products`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      
      setProducts([res.data.data, ...products]);
      setActiveModal(null);
      setProductForm({ name: '', category: 'Food & Treats', price: '', stock: '', description: '' });
      setProductPhotoUri(null);
      Alert.alert('Success', 'Product added!');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to add product');
    }
  };

  // Profile rendering logic...
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      {/* Profile Card */}
      <View className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex-row items-center justify-between mb-8">
        <View className="flex-row items-center">
          <Image 
            source={{ uri: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name)}&background=f97316&color=fff` }}
            className="w-20 h-20 rounded-full border-4 border-orange-50 mr-4"
          />
          <View>
            <Text className="text-xl font-bold text-gray-800">{user?.name}</Text>
            <Text className="text-sm text-gray-500">{user?.email}</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => setActiveModal('profile')}
          className="border-2 border-orange-500 px-4 py-2 rounded-xl"
        >
          <Text className="text-orange-500 font-bold">Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal visible={activeModal === 'profile'} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6 h-3/4">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Edit Profile</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X color="gray" size={24} />
              </TouchableOpacity>
            </View>
            
            <View className="items-center mb-6">
              <TouchableOpacity onPress={() => pickImage(setAvatarUri)} className="relative">
                {avatarUri || user?.avatar ? (
                  <Image 
                    source={{ uri: avatarUri || user?.avatar }}
                    className="w-24 h-24 rounded-full border-4 border-orange-50"
                  />
                ) : (
                  <View className="w-24 h-24 rounded-full border-4 border-orange-50 bg-gray-100 items-center justify-center">
                    <User color="#9ca3af" size={40} />
                  </View>
                )}
                <View className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-2">
                  <ImageIcon color="white" size={16} />
                </View>
              </TouchableOpacity>
            </View>

            <ScrollView className="space-y-4">
              <View>
                <Text className="text-xs font-bold text-gray-600 mb-1">FULL NAME</Text>
                <TextInput 
                  value={editName}
                  onChangeText={setEditName}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base"
                />
              </View>
              <View>
                <Text className="text-xs font-bold text-gray-600 mb-1">EMAIL ADDRESS</Text>
                <TextInput 
                  value={user?.email}
                  editable={false}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base bg-gray-50 text-gray-500"
                />
              </View>
              
              <TouchableOpacity 
                onPress={handleSaveProfile}
                className="w-full bg-orange-500 py-4 rounded-xl mt-4 items-center mb-10"
              >
                <Text className="text-white font-bold">Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Pet Modal */}
      <Modal visible={activeModal === 'pet'} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6 h-5/6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Add Pet</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X color="gray" size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView className="space-y-4" showsVerticalScrollIndicator={false}>
              <TouchableOpacity onPress={() => pickImage(setPetPhotoUri)} className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl items-center justify-center mb-4">
                {petPhotoUri ? <Image source={{ uri: petPhotoUri }} className="w-full h-full rounded-2xl" /> : <View className="items-center"><ImageIcon color="#9ca3af" size={32} /><Text className="text-gray-500 mt-2 font-medium">Upload Pet Photo</Text></View>}
              </TouchableOpacity>
              <View><Text className="text-xs font-bold text-gray-600 mb-1">PET NAME</Text><TextInput value={petForm.name} onChangeText={t => setPetForm({...petForm, name: t})} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base" placeholder="Max" /></View>
              <View className="flex-row gap-4">
                <View className="flex-1"><Text className="text-xs font-bold text-gray-600 mb-1">SPECIES</Text><TextInput value={petForm.species} onChangeText={t => setPetForm({...petForm, species: t})} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base" placeholder="Dog" /></View>
                <View className="flex-1"><Text className="text-xs font-bold text-gray-600 mb-1">BREED</Text><TextInput value={petForm.breed} onChangeText={t => setPetForm({...petForm, breed: t})} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base" placeholder="Golden Retriever" /></View>
              </View>
              <View><Text className="text-xs font-bold text-gray-600 mb-1">AGE</Text><TextInput value={petForm.age} onChangeText={t => setPetForm({...petForm, age: t})} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base" placeholder="2 Years" /></View>
              <View><Text className="text-xs font-bold text-gray-600 mb-1">DESCRIPTION</Text><TextInput multiline numberOfLines={3} textAlignVertical="top" value={petForm.description} onChangeText={t => setPetForm({...petForm, description: t})} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base" placeholder="A friendly dog..." /></View>
              <TouchableOpacity onPress={handleSavePet} className="w-full bg-orange-500 py-4 rounded-xl mt-4 items-center mb-10"><Text className="text-white font-bold">Add Pet</Text></TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Item Modal */}
      <Modal visible={activeModal === 'product'} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6 h-5/6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Add Item</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X color="gray" size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView className="space-y-4" showsVerticalScrollIndicator={false}>
              <TouchableOpacity onPress={() => pickImage(setProductPhotoUri)} className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl items-center justify-center mb-4">
                {productPhotoUri ? <Image source={{ uri: productPhotoUri }} className="w-full h-full rounded-2xl" /> : <View className="items-center"><ImageIcon color="#9ca3af" size={32} /><Text className="text-gray-500 mt-2 font-medium">Upload Item Photo</Text></View>}
              </TouchableOpacity>
              <View><Text className="text-xs font-bold text-gray-600 mb-1">ITEM NAME</Text><TextInput value={productForm.name} onChangeText={t => setProductForm({...productForm, name: t})} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base" placeholder="Leather Collar" /></View>
              <View className="flex-row gap-4">
                <View className="flex-1"><Text className="text-xs font-bold text-gray-600 mb-1">PRICE (PKR)</Text><TextInput keyboardType="numeric" value={productForm.price} onChangeText={t => setProductForm({...productForm, price: t})} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base" placeholder="1500" /></View>
                <View className="flex-1"><Text className="text-xs font-bold text-gray-600 mb-1">STOCK</Text><TextInput keyboardType="numeric" value={productForm.stock} onChangeText={t => setProductForm({...productForm, stock: t})} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base" placeholder="10" /></View>
              </View>
              <View><Text className="text-xs font-bold text-gray-600 mb-1">DESCRIPTION</Text><TextInput multiline numberOfLines={3} textAlignVertical="top" value={productForm.description} onChangeText={t => setProductForm({...productForm, description: t})} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base" placeholder="A high quality collar..." /></View>
              <TouchableOpacity onPress={handleSaveProduct} className="w-full bg-blue-500 py-4 rounded-xl mt-4 items-center mb-10"><Text className="text-white font-bold">List Item</Text></TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* My Pets Section */}
      <View className="mb-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-800">My Pets</Text>
          <TouchableOpacity onPress={() => setActiveModal('pet')} className="bg-orange-100 px-3 py-1.5 rounded-lg flex-row items-center">
            <Plus color="#f97316" size={16} />
            <Text className="text-orange-500 font-bold ml-1">Add Pet</Text>
          </TouchableOpacity>
        </View>

        {pets.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center border border-gray-100">
            <Heart color="#d1d5db" size={40} />
            <Text className="text-gray-400 mt-2 font-medium">You haven't added any pets yet.</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
            {pets.map(pet => (
              <View key={pet._id} className="bg-white rounded-2xl p-4 mr-4 border border-gray-100 w-48 shadow-sm">
                <Image 
                  source={{ uri: pet.photos?.[0] || 'https://via.placeholder.com/150' }} 
                  className="w-full h-32 rounded-xl mb-3 bg-gray-100" 
                />
                <Text className="font-bold text-lg text-gray-800">{pet.name}</Text>
                <Text className="text-gray-500 text-sm">{pet.breed || pet.species}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* My Shop Items Section */}
      <View className="mb-12">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-800">My Shop Items</Text>
          <TouchableOpacity onPress={() => setActiveModal('product')} className="bg-blue-50 px-3 py-1.5 rounded-lg flex-row items-center">
            <Plus color="#3b82f6" size={16} />
            <Text className="text-blue-500 font-bold ml-1">Add Item</Text>
          </TouchableOpacity>
        </View>

        {products.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center border border-gray-100">
            <Box color="#d1d5db" size={40} />
            <Text className="text-gray-400 mt-2 font-medium">No items listed for sale.</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
            {products.map(product => (
              <View key={product._id} className="bg-white rounded-2xl p-4 mr-4 border border-gray-100 w-48 shadow-sm">
                <Image 
                  source={{ uri: product.photos?.[0] || 'https://via.placeholder.com/150' }} 
                  className="w-full h-32 rounded-xl mb-3 bg-gray-100" 
                />
                <Text className="font-bold text-gray-800" numberOfLines={1}>{product.name}</Text>
                <Text className="text-orange-500 font-bold mt-1">PKR {product.price}</Text>
                <Text className="text-gray-400 text-xs mt-1">Stock: {product.stock}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
}
