import { useEffect } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';

export default function Splash() {
  console.log('Splash screen rendered');
  
  useEffect(() => {
    console.log('Splash useEffect triggered');
    const timer = setTimeout(() => {
      console.log('Navigating to onboarding');
      router.replace('/onboarding');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.debugText}>Splash Screen Loading...</Text>
      <Image 
        source={require('../assets/fairmont-logo.png')} 
        style={styles.logo} 
        resizeMode="contain"
        onError={(error) => console.log('Image loading error:', error)}
      />
      <Text style={styles.fallbackText}>Fairmont</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f0f0f0' 
  },
  debugText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20
  },
  logo: { 
    width: 200, 
    height: 200 
  },
  fallbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333'
  }
});