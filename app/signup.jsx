import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { AuthService } from '../src/services/authService';

export default function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.signup({
        full_name: fullName,
        email: email,
        password: password
      });
      Alert.alert('Success', 'Account created successfully!');
      router.replace('/chatbot');
    } catch (error) {
      Alert.alert('Error', error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <Image source={require('../assets/chatbot-logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Fairmont's AI Assistant</Text>
        
        <View style={styles.formContainer}>
          <TextInput 
            placeholder="Full Name" 
            style={styles.input} 
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput 
            placeholder="Email Address" 
            style={styles.input} 
            keyboardType="email-address"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput 
            placeholder="Create Password" 
            style={styles.input} 
            secureTextEntry
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.loginLink}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/signin')}>
            <Text style={styles.loginLinkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
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
  logo: { 
    width: 100, 
    height: 100, 
    marginBottom: 30,
    tintColor: '#8B7355'
  },
  title: { 
    fontSize: 32, 
    fontWeight: '600',
    marginBottom: 8,
    color: '#2c2c2c'
  },
  subtitle: { 
    fontSize: 16, 
    color: '#6c757d', 
    marginBottom: 40,
    fontWeight: '300'
  },
  formContainer: {
    width: '100%',
    marginBottom: 30,
  },
  input: { 
    width: '100%', 
    height: 50, 
    borderColor: '#e0e0e0', 
    borderWidth: 1, 
    borderRadius: 12, 
    marginBottom: 16, 
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    fontSize: 16,
    color: '#2c2c2c'
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
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  loginLink: {
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
  },
  loginText: { 
    color: '#6c757d', 
    fontSize: 16,
    fontWeight: '300'
  },
  loginLinkText: { 
    color: '#8B7355', 
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline'
  },
});