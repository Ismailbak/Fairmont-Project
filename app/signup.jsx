import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

export default function SignUp() {
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
          />
          <TextInput 
            placeholder="Email Address" 
            style={styles.input} 
            keyboardType="email-address"
            placeholderTextColor="#999"
          />
          <TextInput 
            placeholder="Create Password" 
            style={styles.input} 
            secureTextEntry
            placeholderTextColor="#999"
          />
        </View>
        
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/chatbot')}>
          <Text style={styles.buttonText}>Create Account</Text>
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