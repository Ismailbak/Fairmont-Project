// app/chatbot.jsx - Redirect to protected chatbot
import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function Chatbot() {
  useEffect(() => {
    // Redirect to protected chatbot
    router.replace('/chatbot_protected');
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#8B7355" />
      <Text style={styles.text}>Redirecting to secure chat...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
  input: { 
    flex: 1, 
    height: 48, 
    borderColor: '#e0e0e0', 
    borderWidth: 1, 
    borderRadius: 24, 
    paddingHorizontal: 20, 
    marginRight: 12,
    backgroundColor: '#fafafa',
    fontSize: 16,
    color: '#2c2c2c',
    letterSpacing: 0.2,
  },
  sendBtn: { 
    backgroundColor: '#8B7355', 
    borderRadius: 24, 
    paddingHorizontal: 20, 
    paddingVertical: 12,
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#8B7355',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendText: { 
    color: '#fff', 
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  historyContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c2c2c',
  },
  closeButton: {
    fontSize: 24,
    color: '#8B7355',
    fontWeight: '600',
  },
  newChatButton: {
    backgroundColor: '#8B7355',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#8B7355',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  newChatText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c2c2c',
    marginBottom: 4,
  },
  historyItemDate: {
    fontSize: 14,
    color: '#6c757d',
  },
  // Loading animation styles
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B7355',
    marginHorizontal: 2,
    opacity: 0.6,
  },
});