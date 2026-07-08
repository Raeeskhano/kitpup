import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, TextInput, ActivityIndicator, Alert, Dimensions } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { X, Plus, Star, ShoppingCart, Image as ImageIcon } from 'lucide-react-native';
import { API_URL } from '../api/config';

const { width } = Dimensions.get('window');

export default function PetShop() {
  const [category, setCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCartId, setAddingToCartId] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postForm, setPostForm] = useState({
    name: '', category: 'Food & Treats', price: '', originalPrice: '', stock: '', description: ''
  });
  const [postPhotoUri, setPostPhotoUri] = useState(null);
  const [postStatus, setPostStatus] = useState('');

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);

  const categories = ['All', 'Food & Treats', 'Apparel', 'Toys', 'Grooming', 'Beds & Crates'];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/v1/products?category=${category}`);
      setProducts(res.data.data);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const handleAddToCart = async (productId) => {
    try {
      setAddingToCartId(productId);
      const storedUser = await AsyncStorage.getItem('kitpup_user');
      let token = '';
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.token || '';
      }

      await axios.post(`${API_URL}/api/v1/products/cart`, {
        productId,
        quantity: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Alert.alert('Success', 'Added to cart');
    } catch (err) {
      console.error('Failed to add to cart', err);
    } finally {
      setAddingToCartId(null);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPostPhotoUri(result.assets[0].uri);
    }
  };

  const handleOpenPostModal = async () => {
    const storedUser = await AsyncStorage.getItem('kitpup_user');
    if (!storedUser) {
      Alert.alert("Login Required", "Please login first to add an item.");
      return;
    }
    setIsModalOpen(true);
  };

  const handlePostSubmit = async () => {
    setPostStatus('submitting');
    try {
      const storedUser = await AsyncStorage.getItem('kitpup_user');
      let token = '';
      if (storedUser) {
        token = JSON.parse(storedUser).token || '';
      }

      const formData = new FormData();
      Object.keys(postForm).forEach(key => {
        if (postForm[key] !== '') {
          formData.append(key, postForm[key]);
        }
      });
      
      if (postPhotoUri) {
        const filename = postPhotoUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('photos', { uri: postPhotoUri, name: filename, type });
      }

      await axios.post(`${API_URL}/api/v1/products`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setPostStatus('success');
      setTimeout(() => {
        setIsModalOpen(false);
        setPostStatus('');
        setPostForm({ name: '', category: 'Food & Treats', price: '', originalPrice: '', stock: '', description: '' });
        setPostPhotoUri(null);
        fetchProducts();
      }, 1500);
    } catch (err) {
      console.error(err);
      setPostStatus('error');
    }
  };

  const renderStars = (rating) => {
    return (
      <View className="flex-row items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} size={14} color={star <= rating ? "#facc15" : "#d1d5db"} fill={star <= rating ? "#facc15" : "transparent"} />
        ))}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4 pt-8">
        <View className="mb-6 flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-bold text-gray-800">Accessories</Text>
            <Text className="text-gray-500 mt-1">Curated essentials for your pet.</Text>
          </View>
          <TouchableOpacity onPress={handleOpenPostModal} className="bg-orange-500 flex-row items-center px-3 py-2 rounded-xl">
            <Plus color="white" size={16} />
            <Text className="text-white font-bold text-sm ml-1">Add</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 h-12">
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat}
              onPress={() => setCategory(cat)}
              className={`mr-3 px-5 justify-center rounded-full border-2 ${
                category === cat 
                  ? 'bg-orange-500 border-orange-500' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text className={`font-bold ${category === cat ? 'text-white' : 'text-gray-600'}`}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products */}
        {loading ? (
          <View className="flex-row flex-wrap justify-between">
            {[...Array(4)].map((_, i) => (
              <View key={i} className="w-[48%] bg-gray-100 h-60 rounded-2xl mb-4"></View>
            ))}
          </View>
        ) : products.length === 0 ? (
          <View className="py-16 items-center justify-center bg-gray-50 rounded-3xl">
            <ShoppingCart color="#d1d5db" size={48} />
            <Text className="font-bold text-lg mt-4 text-gray-500">No {category !== 'All' ? category : ''} products yet.</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {products.map(product => (
              <TouchableOpacity 
                key={product._id} 
                onPress={() => { setDetailProduct(product); setIsDetailModalOpen(true); }}
                className="w-[48%] bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-4"
              >
                <View className="h-32 bg-gray-50 relative">
                  {product.photos && product.photos.length > 0 ? (
                    <Image source={{ uri: product.photos[0] }} className="w-full h-full" />
                  ) : (
                    <View className="w-full h-full items-center justify-center">
                      <Text className="text-gray-400 text-xs">No Image</Text>
                    </View>
                  )}
                  {product.badge && (
                    <View className={`absolute top-2 left-2 px-2 py-1 rounded ${product.badge.toLowerCase() === 'sale' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                      <Text className="text-white text-[10px] font-bold uppercase tracking-wider">{product.badge}</Text>
                    </View>
                  )}
                </View>
                <View className="p-3">
                  <View className="flex-row items-center mb-1">
                    {renderStars(product.rating || 0)}
                    <Text className="text-[10px] text-gray-400 font-medium ml-1">({product.reviewCount || 0})</Text>
                  </View>
                  <Text className="font-bold text-gray-800 text-sm mb-1" numberOfLines={2}>{product.name}</Text>
                  <Text className="text-base font-bold text-[#92400E]">PKR {product.price}</Text>
                  
                  <TouchableOpacity 
                    onPress={() => handleAddToCart(product._id)}
                    disabled={product.stock === 0 || addingToCartId === product._id}
                    className={`w-full py-2 rounded-xl mt-2 items-center ${product.stock > 0 ? 'bg-[#92400E]' : 'bg-gray-100'}`}
                  >
                    <Text className={`font-bold text-sm ${product.stock > 0 ? 'text-white' : 'text-gray-400'}`}>
                      {addingToCartId === product._id ? 'Adding...' : (product.stock > 0 ? 'Add to Cart' : 'Out of Stock')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View className="h-10" />
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={isDetailModalOpen} animationType="slide" transparent={false}>
        {detailProduct && (
          <View className="flex-1 bg-white">
            <ScrollView>
              <View className="h-[40vh] bg-gray-100 relative">
                {detailProduct.photos && detailProduct.photos.length > 0 ? (
                  <Image source={{ uri: detailProduct.photos[0] }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <ImageIcon color="gray" size={48} />
                  </View>
                )}
                <TouchableOpacity 
                  onPress={() => { setIsDetailModalOpen(false); setDetailProduct(null); }}
                  className="absolute top-12 right-4 bg-white/80 p-2 rounded-full"
                >
                  <X color="black" size={24} />
                </TouchableOpacity>
              </View>
              
              <View className="p-6">
                <Text className="text-[#92400E] font-bold text-sm uppercase mb-2">{detailProduct.category}</Text>
                <Text className="text-3xl font-black text-gray-800 mb-2">{detailProduct.name}</Text>
                
                <View className="flex-row items-center mb-4">
                  {renderStars(detailProduct.rating || 0)}
                  <Text className="text-sm text-gray-500 font-medium ml-2">{detailProduct.reviewCount || 0} Reviews</Text>
                </View>

                <View className="flex-row items-baseline mb-6">
                  <Text className="text-3xl font-black text-gray-800 mr-2">PKR {detailProduct.price}</Text>
                  {detailProduct.originalPrice ? (
                    <Text className="text-lg text-gray-400 line-through font-medium">PKR {detailProduct.originalPrice}</Text>
                  ) : null}
                </View>

                <Text className="text-lg font-bold text-gray-800 mb-2">Product Details</Text>
                <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-4">
                  <Text className="text-gray-600 leading-relaxed">{detailProduct.description || 'No description available.'}</Text>
                </View>

                <Text className={`font-medium ${detailProduct.stock > 0 ? 'text-gray-500' : 'text-red-500'}`}>
                  {detailProduct.stock > 0 ? `${detailProduct.stock} in stock` : 'Out of Stock'}
                </Text>
              </View>
            </ScrollView>
            
            <View className="p-4 border-t border-gray-100 bg-white">
              <TouchableOpacity 
                onPress={() => handleAddToCart(detailProduct._id)}
                disabled={detailProduct.stock === 0 || addingToCartId === detailProduct._id}
                className={`py-4 rounded-xl items-center flex-row justify-center ${detailProduct.stock > 0 ? 'bg-[#92400E]' : 'bg-gray-200'}`}
              >
                <ShoppingCart color={detailProduct.stock > 0 ? "white" : "gray"} size={20} className="mr-2" />
                <Text className={`font-bold text-lg ${detailProduct.stock > 0 ? 'text-white' : 'text-gray-400'}`}>
                  {addingToCartId === detailProduct._id ? 'Adding...' : (detailProduct.stock > 0 ? 'Add to Cart' : 'Out of Stock')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      {/* Post Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6 h-5/6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">List an Accessory</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X color="gray" size={24} />
              </TouchableOpacity>
            </View>
            
            <ScrollView className="space-y-4" showsVerticalScrollIndicator={false}>
              {/* Image Picker */}
              <TouchableOpacity 
                onPress={pickImage}
                className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl items-center justify-center mb-4"
              >
                {postPhotoUri ? (
                  <Image source={{ uri: postPhotoUri }} className="w-full h-full rounded-2xl" />
                ) : (
                  <View className="items-center">
                    <ImageIcon color="#9ca3af" size={32} />
                    <Text className="text-gray-400 mt-2 font-medium">Upload Product Photo</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View>
                <Text className="text-xs font-bold text-gray-600 mb-1">PRODUCT NAME</Text>
                <TextInput 
                  value={postForm.name}
                  onChangeText={(t) => setPostForm({...postForm, name: t})}
                  placeholder="e.g. Premium Leather Collar"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base"
                />
              </View>

              <View className="flex-row justify-between">
                <View className="w-[48%]">
                  <Text className="text-xs font-bold text-gray-600 mb-1">PRICE (PKR)</Text>
                  <TextInput 
                    value={postForm.price}
                    onChangeText={(t) => setPostForm({...postForm, price: t})}
                    placeholder="e.g. 1500"
                    keyboardType="numeric"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base"
                  />
                </View>
                <View className="w-[48%]">
                  <Text className="text-xs font-bold text-gray-600 mb-1">STOCK QUANTITY</Text>
                  <TextInput 
                    value={postForm.stock}
                    onChangeText={(t) => setPostForm({...postForm, stock: t})}
                    placeholder="e.g. 10"
                    keyboardType="numeric"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base"
                  />
                </View>
              </View>

              <View>
                <Text className="text-xs font-bold text-gray-600 mb-1">DESCRIPTION</Text>
                <TextInput 
                  value={postForm.description}
                  onChangeText={(t) => setPostForm({...postForm, description: t})}
                  placeholder="Describe the product..."
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base min-h-[100px]"
                />
              </View>

              <TouchableOpacity 
                onPress={handlePostSubmit}
                disabled={postStatus === 'submitting'}
                className={`w-full py-4 rounded-xl mt-6 items-center ${postStatus === 'submitting' ? 'bg-orange-300' : 'bg-orange-500'}`}
              >
                {postStatus === 'submitting' ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">List Product</Text>
                )}
              </TouchableOpacity>
              <View className="h-20" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
