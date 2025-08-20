import { useEffect, useRef } from 'react';
<<<<<<< HEAD
import { View, Image, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';

export default function Home() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Fade in and scale up animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo pulsing animation
    const pulseAnimation = () => {
      Animated.sequence([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => pulseAnimation());
    };

    pulseAnimation();

    // Navigate to onboarding after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);
=======
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
>>>>>>> 8bea2d5 (Update README with Ollama documentation and improve project structure)

  return (
    <View style={styles.container}>
      <Animated.View style={[
<<<<<<< HEAD
        styles.logoContainer, 
=======
        styles.contentContainer, 
>>>>>>> 8bea2d5 (Update README with Ollama documentation and improve project structure)
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
<<<<<<< HEAD
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff' 
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { 
    width: 280, 
    height: 280,
    tintColor: '#8B7355'
  },
});
=======
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
>>>>>>> 8bea2d5 (Update README with Ollama documentation and improve project structure)
