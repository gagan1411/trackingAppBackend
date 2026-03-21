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
import RNFS from 'react-native-fs';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const copyHouseImages = async () => {
      const sourceFolder = 'Galuta/files';
      const destFolder = RNFS.DocumentDirectoryPath + '/Galuta/files';

      const exists = await RNFS.exists(destFolder);
      if (!exists) {
        await RNFS.mkdir(destFolder);
      }

      // console.log('hello', await RNFS.readDirAssets(sourceFolder));
      console.log(`Copying images from assets/${sourceFolder} to ${destFolder}`);
      const files = await RNFS.readDirAssets(sourceFolder);
      console.log('Files found: ', files);

      for (const file of files) {
        const destPath = destFolder + '/' + file.name;

        const fileExists = await RNFS.exists(destPath);
        const check = await RNFS.exists(
          RNFS.DocumentDirectoryPath + "/Galuta/files/" + file.name
        );
        console.log("Image exists:", check);
        console.log(`Checking ${file.name}: exists in internal storage?`, fileExists);
        if (!fileExists) {
          await RNFS.copyFileAssets(
            sourceFolder + '/' + file.name,
            destPath
          );
          console.log(`Copied ${file.name} to ${destPath}`);
        }
      }

      // console.log(`All images copied to ${destPath}`);
    };
    const copyPersImages = async () => {
      const sourceFolder = 'Galuta/persImages';
      const destFolder = RNFS.DocumentDirectoryPath + '/Galuta/persImages';

      const exists = await RNFS.exists(destFolder);
      if (!exists) {
        await RNFS.mkdir(destFolder);
      }

      // console.log('hello', await RNFS.readDirAssets(sourceFolder));
      console.log(`Copying images from assets/${sourceFolder} to ${destFolder}`);
      const files = await RNFS.readDirAssets(sourceFolder);
      console.log('Files found: ', files);

      for (const file of files) {
        const destPath = destFolder + '/' + file.name;

        const fileExists = await RNFS.exists(destPath);
        const check = await RNFS.exists(
          RNFS.DocumentDirectoryPath + "/Galuta/persImages/" + file.name
        );
        console.log("Image exists:", check);
        console.log(`Checking ${file.name}: exists in internal storage?`, fileExists);
        if (!fileExists) {
          await RNFS.copyFileAssets(
            sourceFolder + '/' + file.name,
            destPath
          );
          console.log(`Copied ${file.name} to ${destPath}`);
        }
      }

      // console.log(`All images copied to ${destPath}`);
    };
    const setup = async () => {
      // await copyAllImages();
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
    copyHouseImages();
    copyPersImages();
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
