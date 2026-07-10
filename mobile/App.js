import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, ScrollView, TouchableOpacity, Text, Platform } from 'react-native';
import { Home, ShoppingBag, MapPin, MessageCircle, User, Search, Settings as SettingsIcon, AlertTriangle, Compass } from 'lucide-react-native';

// Placeholder imports for pages
import Login from './src/pages/auth/Login';
import Register from './src/pages/auth/Register';
import ForgotPassword from './src/pages/auth/ForgotPassword';

import TopBar from './src/components/TopBar';

import Dashboard from './src/pages/Dashboard';
import Marketplace from './src/pages/Marketplace';
import PetShop from './src/pages/PetShop';
import RescueReport from './src/pages/RescueReport';
import LostFound from './src/pages/LostFound';
import AIChat from './src/pages/AIChat';
import VetLocator from './src/pages/VetLocator';
import Profile from './src/pages/Profile';
import Settings from './src/pages/Settings';
import Cart from './src/pages/Cart';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Horizontally Scrollable Tab Bar
function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View className="bg-white border-t border-gray-200" style={{ paddingBottom: Platform.OS === 'ios' ? 24 : 12, paddingTop: 12 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 24 }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const color = isFocused ? '#3b82f6' : 'gray';

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              className="items-center justify-center min-w-[50px]"
            >
              {options.tabBarIcon && options.tabBarIcon({ color, size: 24 })}
              <Text style={{ color, fontSize: 10, marginTop: 6, fontWeight: isFocused ? 'bold' : 'normal' }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// Bottom Tab Navigator for main authenticated routes
function MainTabs({ user, setUser }) {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Dashboard') return <Home color={color} size={size} />;
          if (route.name === 'Marketplace') return <Search color={color} size={size} />;
          if (route.name === 'Shop') return <ShoppingBag color={color} size={size} />;
          if (route.name === 'Rescue') return <AlertTriangle color={color} size={size} />;
          if (route.name === 'LostFound') return <Compass color={color} size={size} />;
          if (route.name === 'Maps') return <MapPin color={color} size={size} />;
          if (route.name === 'AIChat') return <MessageCircle color={color} size={size} />;
          if (route.name === 'Profile') return <User color={color} size={size} />;
          if (route.name === 'Settings') return <SettingsIcon color={color} size={size} />;
        },
        header: ({ navigation, route, options }) => {
          const title = options.title !== undefined ? options.title : route.name;
          return <TopBar title={title} navigation={navigation} user={user} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Marketplace" component={Marketplace} options={{ title: 'Marketplace' }} />
      <Tab.Screen name="Shop" component={PetShop} options={{ title: 'Pet Shop' }} />
      <Tab.Screen name="Rescue" component={RescueReport} options={{ title: 'Rescue' }} />
      <Tab.Screen name="LostFound" component={LostFound} options={{ title: 'Lost/Found' }} />
      <Tab.Screen name="Maps" component={VetLocator} options={{ title: 'Nearby Clinics' }} />
      <Tab.Screen name="AIChat" component={AIChat} options={{ title: 'KitPup AI' }} />
      <Tab.Screen name="Profile" options={{ title: 'My Profile' }}>
        {(props) => <Profile {...props} user={user} setUser={setUser} />}
      </Tab.Screen>
      <Tab.Screen name="Settings" options={{ title: 'Settings' }}>
        {(props) => <Settings {...props} setUser={setUser} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('kitpup_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load user', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          header: ({ navigation, route, options, back }) => {
            const title = options.title !== undefined ? options.title : route.name;
            return <TopBar title={title} back={back} navigation={navigation} />;
          }
        }}
      >
        {!user ? (
          // Auth Stack
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login">
              {(props) => <Login {...props} setUser={setUser} />}
            </Stack.Screen>
            <Stack.Screen name="Register">
              {(props) => <Register {...props} setUser={setUser} />}
            </Stack.Screen>
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          </Stack.Group>
        ) : (
          // App Stack
          <Stack.Group>
            <Stack.Screen name="Main" options={{ headerShown: false }}>
              {(props) => <MainTabs {...props} user={user} setUser={setUser} />}
            </Stack.Screen>
            <Stack.Screen name="Marketplace" component={Marketplace} options={{ title: 'Marketplace' }} />
            <Stack.Screen name="Cart" component={Cart} options={{ title: 'Shopping Cart' }} />
            <Stack.Screen name="RescueReport" component={RescueReport} options={{ title: 'Rescue & Report' }} />
            <Stack.Screen name="LostFound" component={LostFound} options={{ title: 'Lost & Found' }} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
