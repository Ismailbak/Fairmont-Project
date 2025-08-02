import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, SafeAreaView, Linking } from 'react-native';
import { router } from 'expo-router';

const SocialIcon = ({ source, onPress }) => (
  <TouchableOpacity style={styles.socialIcon} onPress={onPress}>
    <Image source={source} style={styles.socialIconImage} resizeMode="contain" />
  </TouchableOpacity>
);

export default function SignIn() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <Image source={require('../assets/chatbot-logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your Fairmont account</Text>
        
        <View style={styles.formContainer}>
          <TextInput 
            placeholder="Email Address" 
            style={styles.input} 
            keyboardType="email-address"
            placeholderTextColor="#999"
          />
          <TextInput 
            placeholder="Password" 
            style={styles.input} 
            secureTextEntry
            placeholderTextColor="#999"
          />
        </View>
        
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/chatbot')}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        
        <View style={styles.signupLink}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.signupLinkText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.socialContainer}>
          <Text style={styles.socialText}>Get to know us more on</Text>
          <View style={styles.socialIcons}>
            <SocialIcon 
              source={require('../assets/facebook.png')} 
              onPress={() => Linking.openURL('https://www.facebook.com/fairmonthotels')} 
            />
            <SocialIcon 
              source={require('../assets/instagram.png')} 
              onPress={() => Linking.openURL('https://www.instagram.com/fairmonthotels/')} 
            />
            <SocialIcon 
              source={require('../assets/linkedin.png')} 
              onPress={() => Linking.openURL('https://www.linkedin.com/company/fairmont-hotels-and-resorts/posts/?feedView=all')} 
            />
            <SocialIcon 
              source={require('../assets/website.png')} 
              onPress={() => Linking.openURL('https://www.fairmont.com/')} 
            />
          </View>
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
  signupLink: {
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
  },
  signupText: { 
    color: '#6c757d', 
    fontSize: 16,
    fontWeight: '300'
  },
  signupLinkText: { 
    color: '#8B7355', 
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline'
  },
  socialContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  socialText: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '300',
    marginBottom: 20,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  socialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  socialIconImage: {
    width: 24,
    height: 24,
    tintColor: '#8B7355',
  },
});