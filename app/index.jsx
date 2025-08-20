import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateSequence = async () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start();

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          router.replace('/chatbot_protected');
        } else {
          const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
          if (hasSeenOnboarding === 'true') {
            router.replace('/signin');
          } else {
            router.replace('/onboarding');
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.replace('/signin');
      }
    };

    animateSequence();
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.contentContainer, 
        { 
          opacity: fadeAnim, 
          transform: [{ scale: scaleAnim }] 
        }
      ]}>
        <Animated.Image 
          source={require('../assets/fairmont-logo.png')} 
          style={[styles.logo, { opacity: logoOpacity }]} 
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});
