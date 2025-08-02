import { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, Animated, Platform } from 'react-native';
import { router } from 'expo-router';

export default function Onboarding() {
  const logoScale = useRef(new Animated.Value(1.5)).current;
  const logoPosition = useRef(new Animated.Value(0)).current;
  const descOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // Logo scales down and moves up slightly
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(logoPosition, {
          toValue: -30,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
      // Text elements fade in
      Animated.parallel([
        Animated.timing(descOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 800,
          delay: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <Animated.View style={[
          styles.logoContainer, 
          { 
            transform: [
              { scale: logoScale },
              { translateY: logoPosition }
            ] 
          }
        ]}>
          <Image source={require('../assets/chatbot-logo.png')} style={styles.logo} resizeMode="contain" />
        </Animated.View>
        
        <Animated.View style={[styles.descContainer, { opacity: descOpacity }]}>
          <Text style={styles.desc}>Your AI-powered assistant for all things Fairmont. Get instant help, answers, and more!</Text>
        </Animated.View>
        
        <Animated.View style={[styles.buttonContainer, { opacity: buttonOpacity }]}>
          <TouchableOpacity style={styles.button} onPress={() => router.replace('/signup')}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff',
    paddingHorizontal: 24 
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  logo: { 
    width: 200, 
    height: 200,
    tintColor: '#8B7355'
  },
  descContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  desc: { 
    fontSize: 16, 
    color: '#6c757d', 
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '300',
    letterSpacing: 0.5
  },
  buttonContainer: {
    width: '100%',
  },
  button: { 
    backgroundColor: '#8B7355', 
    padding: 18, 
    borderRadius: 12, 
    width: '100%', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1
  },
});