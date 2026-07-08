import { Platform } from 'react-native';

// When running on Android emulator, 10.0.2.2 points to the host machine's localhost.
// iOS simulator can just use localhost.
// Physical devices will need your computer's actual local IP address on the network (e.g. 192.168.1.100).

const DEV_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
const PROD_URL = 'https://kitpup.vercel.app'; // Pointing to your live Vercel cloud server!

export const API_URL = __DEV__ ? DEV_URL : PROD_URL;
