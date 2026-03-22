import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const DEFAULT_API_URL = 'https://backend-e4a6.onrender.com/api';
// https://backend-e4a6.onrender.com

const api = axios.create({
    baseURL: DEFAULT_API_URL,
    timeout: 15000,
});

api.interceptors.request.use(async (config) => {
    // FORCEFULLY OVERRIDING OLD SETTINGS
    // We are totally bypassing `localtunnel` AND any old `172.x` / `10.x` raw ips saved in the cache.
    // The mobile app will ONLY dynamically use the live internet matrix URL right now!
    config.baseURL = DEFAULT_API_URL;

    // Attempt standard authentication lookup
    const token = await SecureStore.getItemAsync('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
