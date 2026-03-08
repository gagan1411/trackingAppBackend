import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { initDB } from './src/database/db';
import { syncData } from './src/services/syncService';
import AppNavigator from './src/navigation/AppNavigator';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import WelcomeScreen from './src/screens/WelcomeScreen';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const setup = async () => {
      // Initialize Database
      await initDB();

      // Check Auth
      const token = await SecureStore.getItemAsync('token');
      setIsAuthenticated(!!token);

      setIsReady(true);

      setTimeout(() => {
        setShowWelcome(false);
      }, 2500);
    };

    setup();
  }, []);

  if (!isReady || showWelcome) return <WelcomeScreen />;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
