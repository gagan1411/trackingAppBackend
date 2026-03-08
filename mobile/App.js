import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { initDB } from './src/database/db';
import { syncData } from './src/services/syncService';
import AppNavigator from './src/navigation/AppNavigator';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const setup = async () => {
      // Initialize Database
      await initDB();

      // Check Auth
      const token = await SecureStore.getItemAsync('token');
      setIsAuthenticated(!!token);

      setIsReady(true);
    };

    setup();
  }, []);

  if (!isReady) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
