import { Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const DEFAULT_API_URL = 'https://pink-news-smoke.loca.lt/api';

const api = axios.create({
    baseURL: DEFAULT_API_URL,
    timeout: 10000, // 10 seconds timeout for remote connections
});

api.interceptors.request.use(async (config) => {
    // Dynamically set baseURL if user configured one
    const customUrl = await SecureStore.getItemAsync('server_url');
    if (customUrl) {
        config.baseURL = customUrl.endsWith('/api') ? customUrl : `${customUrl}/api`;
    }

    const token = await SecureStore.getItemAsync('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        if (status && status >= 400 && status < 500) {
            // Client errors (400, 401, 403, etc.) are expected — don't show LogBox
            console.warn('API Client Error:', status, error?.response?.data?.msg || error.message);
        } else if (error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
            console.warn('API Network Error:', error.message);
            Alert.alert('No Connection', 'Cannot reach server. Working in offline mode.');
        } else {
            console.error('API Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
