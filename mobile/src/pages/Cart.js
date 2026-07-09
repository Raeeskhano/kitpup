import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, DeviceEventEmitter, Modal, SafeAreaView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { API_URL } from '../api/config';
import { Trash2, Plus, Minus, ShoppingCart, X } from 'lucide-react-native';

export default function Cart({ navigation }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const getToken = async () => {
    const storedUser = await AsyncStorage.getItem('kitpup_user');
    return storedUser ? JSON.parse(storedUser).token : '';
  };

  const fetchCart = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API_URL}/api/v1/products/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity <= 0) {
      return removeItem(productId);
    }

    try {
      setActionLoading(true);
      const token = await getToken();
      const res = await axios.put(`${API_URL}/api/v1/products/cart/${productId}`, {
        quantity: newQuantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(res.data.data);
      DeviceEventEmitter.emit('cartUpdated');
    } catch (err) {
      Alert.alert('Error', 'Failed to update quantity');
    } finally {
      setActionLoading(false);
    }
  };

  const removeItem = async (productId) => {
    try {
      setActionLoading(true);
      const token = await getToken();
      const res = await axios.delete(`${API_URL}/api/v1/products/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(res.data.data);
      DeviceEventEmitter.emit('cartUpdated');
    } catch (err) {
      Alert.alert('Error', 'Failed to remove item');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      setActionLoading(true);
      const token = await getToken();
      const res = await axios.post(`${API_URL}/api/v1/payments/create-checkout-session`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data && res.data.url) {
        setCheckoutUrl(res.data.url);
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Checkout failed to initiate');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWebViewNavigation = (navState) => {
    const { url } = navState;
    if (url.includes('/checkout/success')) {
      setCheckoutUrl(null);
      setCart([]);
      DeviceEventEmitter.emit('cartUpdated');
      Alert.alert('Success', 'Payment completed successfully!');
      navigation.navigate('Shop');
    } else if (url.includes('/checkout/cancel')) {
      setCheckoutUrl(null);
      Alert.alert('Cancelled', 'Payment was cancelled.');
    }
  };

  const totalAmount = cart.reduce((total, item) => {
    if (item.productId && item.productId.price) {
      return total + (item.productId.price * item.quantity);
    }
    return total;
  }, 0);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (cart.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center p-4">
        <ShoppingCart color="#d1d5db" size={64} className="mb-4" />
        <Text className="text-xl font-bold text-gray-800 mb-2">Your Cart is Empty</Text>
        <Text className="text-gray-500 text-center">Looks like you haven't added anything to your cart yet.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        {cart.map((item, index) => {
          if (!item.productId) return null;
          const product = item.productId;
          return (
            <View key={index} className="flex-row bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
              <View className="w-20 h-20 bg-gray-100 rounded-xl mr-4 overflow-hidden">
                {product.photos && product.photos.length > 0 ? (
                  <Image source={{ uri: product.photos[0] }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="w-full h-full justify-center items-center">
                    <Text className="text-gray-400 text-xs">No Image</Text>
                  </View>
                )}
              </View>
              
              <View className="flex-1 justify-between">
                <View>
                  <Text className="font-bold text-gray-800 text-base" numberOfLines={1}>{product.name}</Text>
                  <Text className="text-[#92400E] font-bold mt-1">PKR {product.price}</Text>
                </View>
                
                <View className="flex-row justify-between items-center mt-2">
                  <View className="flex-row items-center border border-gray-200 rounded-lg">
                    <TouchableOpacity 
                      onPress={() => updateQuantity(product._id, item.quantity, -1)}
                      disabled={actionLoading}
                      className="px-2 py-1"
                    >
                      <Minus color="gray" size={16} />
                    </TouchableOpacity>
                    <Text className="px-3 font-bold text-gray-800">{item.quantity}</Text>
                    <TouchableOpacity 
                      onPress={() => updateQuantity(product._id, item.quantity, 1)}
                      disabled={actionLoading}
                      className="px-2 py-1"
                    >
                      <Plus color="gray" size={16} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity 
                    onPress={() => removeItem(product._id)}
                    disabled={actionLoading}
                    className="p-2 bg-red-50 rounded-lg"
                  >
                    <Trash2 color="#ef4444" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
        <View className="h-24" />
      </ScrollView>

      <View className="p-4 bg-white border-t border-gray-100 pb-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-500 font-bold">Total Amount</Text>
          <Text className="text-2xl font-black text-gray-800">PKR {totalAmount}</Text>
        </View>
        <TouchableOpacity 
          onPress={handleCheckout}
          disabled={actionLoading}
          className={`w-full py-4 rounded-xl items-center ${actionLoading ? 'bg-orange-300' : 'bg-orange-500'}`}
        >
          {actionLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Checkout with Stripe</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={!!checkoutUrl} animationType="slide">
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
            <Text className="text-lg font-bold text-gray-800">Secure Checkout</Text>
            <TouchableOpacity onPress={() => setCheckoutUrl(null)}>
              <X color="#4b5563" size={24} />
            </TouchableOpacity>
          </View>
          {checkoutUrl && (
            <WebView 
              source={{ uri: checkoutUrl }} 
              onNavigationStateChange={handleWebViewNavigation}
              startInLoadingState={true}
              renderLoading={() => (
                <View className="absolute inset-0 items-center justify-center bg-white">
                  <ActivityIndicator size="large" color="#f97316" />
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}
