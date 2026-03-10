import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
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
      }, 5500);
    };

    setup();
  }, []);

  if (!isReady) return <WelcomeScreen />;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <SafeAreaProvider>
        <NavigationContainer
          theme={{
            ...DefaultTheme,
            colors: {
              ...DefaultTheme.colors,
              background: '#000',
            },
          }}
        >
          <StatusBar style="light" />
          <AppNavigator
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
          />
        </NavigationContainer>
      </SafeAreaProvider>

      {showWelcome && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <WelcomeScreen />
        </View>
      )}
    </View>
  );
}
