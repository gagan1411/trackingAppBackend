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

const WelcomeScreen = () => {

    const [fontsLoaded] = useFonts({
        Script: GreatVibes_400Regular
    });

    const welcomeOpacity = useSharedValue(0);
    const brandOpacity = useSharedValue(0);

    useEffect(() => {

        welcomeOpacity.value = withTiming(1, {
            duration: 1400,
            easing: Easing.out(Easing.cubic)
        });

        brandOpacity.value = withDelay(
            800,
            withTiming(1, {
                duration: 1600,
                easing: Easing.out(Easing.cubic)
            })
        );

    }, []);

    const welcomeStyle = useAnimatedStyle(() => ({
        opacity: welcomeOpacity.value,
        transform: [
            { translateY: welcomeOpacity.value === 1 ? 0 : 10 }
        ]
    }));

    const brandStyle = useAnimatedStyle(() => ({
        opacity: brandOpacity.value,
        transform: [
            { translateY: brandOpacity.value === 1 ? 0 : 10 }
        ]
    }));

    if (!fontsLoaded) return null;

    return (

        <View style={styles.container}>

            <Animated.Text style={[styles.welcomeText, welcomeStyle]}>
                Welcome to
            </Animated.Text>

            <Animated.Text style={[styles.brandText, brandStyle]}>
                Bemisaal Rakshak
            </Animated.Text>

        </View>

    );
};

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000'
    },

    welcomeText: {
        fontSize: 30,
        color: '#FFFFFF',
        fontFamily: 'Script',
        marginBottom: 10
    },

    brandText: {
        fontSize: 46,
        color: '#FFFFFF',
        fontFamily: 'Script',
        letterSpacing: 1,
        textAlign: 'center'
    }

});

export default WelcomeScreen;