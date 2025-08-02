import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Modal } from 'react-native';
import { router } from 'expo-router';
import { getApiUrl, CONFIG } from './config';

const DUMMY_MESSAGES = [
  { from: 'bot', text: 'Hello! How can I help you today?' },
  { from: 'user', text: 'Tell me about Fairmont.' },
  { from: 'bot', text: 'Fairmont is a leading provider of luxury hospitality with iconic properties worldwide.' },
];

const CHAT_HISTORY = [
  { id: 1, title: 'Hotel Booking Inquiry', date: 'Today' },
  { id: 2, title: 'Restaurant Recommendations', date: 'Yesterday' },
  { id: 3, title: 'Spa Services Information', date: '2 days ago' },
  { id: 4, title: 'Concierge Services', date: '3 days ago' },
];

export default function Chatbot() {
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const scrollViewRef = useRef();

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages([...messages, { from: 'user', text: userMessage }]);
    setInput('');
    
    // Show loading message
    setMessages(msgs => [...msgs, { from: 'bot', text: 'Thinking...', isLoading: true }]);
    
    try {
      const response = await fetch(getApiUrl(CONFIG.API.ENDPOINTS.CHAT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Replace loading message with actual response
        setMessages(msgs => {
          const newMessages = msgs.filter(msg => !msg.isLoading);
          return [...newMessages, { from: 'bot', text: data.context }];
        });
      } else {
        // Handle error
        setMessages(msgs => {
          const newMessages = msgs.filter(msg => !msg.isLoading);
          return [...newMessages, { from: 'bot', text: 'Sorry, I encountered an error. Please try again.' }];
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Replace loading message with error
      setMessages(msgs => {
        const newMessages = msgs.filter(msg => !msg.isLoading);
        return [...newMessages, { from: 'bot', text: 'Sorry, I\'m having trouble connecting to the server. Please check your connection and try again.' }];
      });
    }
  };

  const handleProfilePress = () => {
    router.push('/settings');
  };

  const handleHistoryPress = () => {
    setShowHistory(true);
  };

  const startNewChat = () => {
    setMessages([{ from: 'bot', text: 'Hello! How can I help you today?' }]);
    setShowHistory(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.brandSection}>
              <TouchableOpacity style={styles.historyButton} onPress={handleHistoryPress}>
                <View style={styles.historyIcon}>
                  <View style={styles.hamburgerLine} />
                  <View style={styles.hamburgerLine} />
                  <View style={styles.hamburgerLine} />
                </View>
              </TouchableOpacity>
              <View style={styles.titleSection}>
                <Text style={styles.brandName}>Fairmont</Text>
                <Text style={styles.assistantText}>AI Assistant</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
              <View style={styles.profilePhoto}>
                <Text style={styles.profileInitial}>U</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView
          style={styles.messages}
          contentContainerStyle={{ padding: 16 }}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, idx) => (
            <View key={idx} style={[styles.message, msg.from === 'user' ? styles.userMsg : styles.botMsg]}>
              <Text style={[styles.msgText, msg.from === 'user' ? styles.userMsgText : styles.botMsgText]}>
                {msg.text}
              </Text>
              {msg.isLoading && (
                <View style={styles.loadingDots}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              )}
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Chat History Modal */}
      <Modal
        visible={showHistory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.historyContainer}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Chat History</Text>
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.newChatButton} onPress={startNewChat}>
              <Text style={styles.newChatText}>New Chat</Text>
            </TouchableOpacity>
            
            <ScrollView style={styles.historyList}>
              {CHAT_HISTORY.map((chat) => (
                <TouchableOpacity key={chat.id} style={styles.historyItem}>
                  <Text style={styles.historyItemTitle}>{chat.title}</Text>
                  <Text style={styles.historyItemDate}>{chat.date}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyButton: {
    padding: 8,
    marginRight: 12,
  },
  historyIcon: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    width: 24,
    height: 2,
    backgroundColor: '#8B7355',
    borderRadius: 1,
  },
  titleSection: {
    flex: 1,
  },
  brandName: { 
    fontSize: 20, 
    fontWeight: '700',
    color: '#2c2c2c',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  assistantText: { 
    fontSize: 12, 
    fontWeight: '400',
    color: '#8B7355',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  profileButton: {
    padding: 4,
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B7355',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B7355',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  messages: { 
    flex: 1, 
    backgroundColor: '#fafafa' 
  },
  message: { 
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 12, 
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userMsg: { 
    backgroundColor: '#8B7355', 
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
  },
  botMsg: { 
    backgroundColor: '#fff', 
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  msgText: { 
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  userMsgText: {
    color: '#fff',
    fontWeight: '400',
  },
  botMsgText: {
    color: '#2c2c2c',
    fontWeight: '400',
  },
  inputRow: { 
    flexDirection: 'row', 
    padding: 16, 
    backgroundColor: '#fff', 
    borderTopWidth: 1, 
    borderColor: '#f0f0f0',
    alignItems: 'center'
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