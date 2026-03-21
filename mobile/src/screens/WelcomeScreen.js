import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing
} from 'react-native-reanimated';

import { useFonts } from 'expo-font';
import { GreatVibes_400Regular } from '@expo-google-fonts/great-vibes';
import { Image } from 'expo-image';

const WelcomeScreen = ({ navigation }: any) => {

  const [fontsLoaded] = useFonts({
    Script: GreatVibes_400Regular
  });

  const welcomeOpacity = useSharedValue(0);
  const brandOpacity = useSharedValue(0);

  useEffect(() => {

    if (!fontsLoaded) return;

    welcomeOpacity.value = withTiming(1, { duration: 1200 });

    brandOpacity.value = withDelay(
      800,
      withTiming(1, { duration: 1500 })
    );

    const timer = setTimeout(() => {
      navigation.replace('RegisterCivilian');
    }, 100000);

    return () => clearTimeout(timer);

  }, []);

  const welcomeStyle = useAnimatedStyle(() => ({
    opacity: welcomeOpacity.value
  }));

  const brandStyle = useAnimatedStyle(() => ({
    opacity: brandOpacity.value
  }));

  return (
    <View style={styles.container}>

      {/* GIF Background */}
      <Image
        source={require('../../assets/trial.gif')}
        style={styles.gif}
        resizeMode="cover"
      />

      {/* Overlay Text */}
      <View style={styles.textContainer}>
        {/* <Animated.Text style={[styles.welcomeText, welcomeStyle]}>
          Welcome to
        </Animated.Text>

        <Animated.Text style={[styles.brandText, brandStyle]}>
          Bemisaal Rakshak
        </Animated.Text> */}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1
  },

  gif: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  },

  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  welcomeText: {
    fontSize: 34,
    color: '#FFF',
    fontFamily: 'Script'
  },

  brandText: {
    fontSize: 52,
    color: '#FFF',
    fontFamily: 'Script'
  }

});

export default WelcomeScreen;