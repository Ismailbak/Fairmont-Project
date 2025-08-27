// app/chatbot_protected.jsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Modal } from 'react-native';
import { router } from 'expo-router';
import AuthGuard from './components/AuthGuard';
import { SessionService } from '../src/services/sessionService';

export default function ChatbotProtected() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const scrollViewRef = useRef();

  const fetchSessions = async () => {
    try {
      const data = await SessionService.listSessions();
      setSessions(data);
      if (!currentSession && data.length > 0) {
        setCurrentSession(data[0]);
      }
    } catch (e) {
      console.log('Error fetching sessions:', e.message);
    }
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  // Ensure typing animation completes even if there are issues
  const ensureTypingCompletes = (botMessage, typingInterval) => {
    // If typing has been going on too long, force complete it
    setTimeout(() => {
      clearInterval(typingInterval);
      setMessages(prev => {
        const updatedMessages = [...prev];
        const typingIndex = updatedMessages.findIndex(m => m.isTyping);
        if (typingIndex !== -1) {
          updatedMessages[typingIndex] = {
            from: 'bot',
            text: botMessage,
            isTyping: false
          };
        }
        return updatedMessages;
      });
      setIsWaitingResponse(false);
    }, 10000); // Force complete after 10 seconds max
  };

  // Add state variables for improved UI feedback
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);
  const [responseStartTime, setResponseStartTime] = useState(null);
  const [typingSpeed, setTypingSpeed] = useState(30); // milliseconds per character

  const sendMessage = async () => {
    if (!input.trim() || isWaitingResponse) return;
    let session = currentSession;
    console.log('Current session:', session);
    
    // Validate session exists and has a valid ID
    if (session && (!session.id || isNaN(parseInt(session.id)))) {
      console.log('Invalid session detected, creating a new one');
      session = null;
    }
    
    try {
      // Set waiting state and start response timer
      setIsWaitingResponse(true);
      setResponseStartTime(Date.now());
      
      if (!session) {
        console.log('Creating new session...');
        session = await SessionService.createSession('New Chat');
        setCurrentSession(session);
        setSessions(prev => [session, ...prev]);
      }
      
      const userMsg = { from: 'user', text: input };
      console.log('Sending message:', userMsg);
      
      // Display the user message and an improved loading indicator
      setMessages(prev => [...prev, userMsg, { 
        from: 'bot', 
        text: 'Thinking...', 
        isLoading: true,
        loadingDots: 0
      }]);
      
      // Save user input and clear the input field
      const userInput = input;
      setInput('');
      
      // Animate the loading dots while waiting
      const loadingInterval = setInterval(() => {
        setMessages(prev => {
          const updatedMessages = [...prev];
          const loadingIndex = updatedMessages.findIndex(m => m.isLoading);
          if (loadingIndex !== -1) {
            const dots = (updatedMessages[loadingIndex].loadingDots + 1) % 4;
            updatedMessages[loadingIndex] = {
              ...updatedMessages[loadingIndex],
              text: 'Thinking' + '.'.repeat(dots)
            };
          }
          return updatedMessages;
        });
      }, 500);
      
      // Send message to backend and wait for response
      const res = await SessionService.sendMessage(session.id, userInput, 'user');
      
      // Clear loading animation interval
      clearInterval(loadingInterval);
      
      // Calculate response time for logs but don't show in UI
      const responseEndTime = Date.now();
      const responseTimeMs = responseEndTime - responseStartTime;
      console.log(`[PERFORMANCE] Response time: ${responseTimeMs/1000}s`);
      
      // Adjust typing speed based on response length for a better UX
      const botResponse = res.bot_message?.message || res.response || res.text || 'No response.';
      const dynamicSpeed = Math.max(10, Math.min(30, 2000 / botResponse.length));
      setTypingSpeed(dynamicSpeed);
      
      // Remove the loading indicator
      setMessages(prev => {
        return prev.filter(m => !m.isLoading);
      });
      
      // Implement typing animation for bot response
      const botMsg = { from: 'bot', text: '', isTyping: true };
      setMessages(prev => [...prev, botMsg]);
      
      // Animate the typing effect
      let displayedText = '';
      const fullText = botResponse;
      let charIndex = 0;
      
      // Set up safety timeout to ensure typing completes
      const safetyTimeout = setTimeout(() => {
        console.log("[Safety] Ensuring typing animation completes");
        setMessages(prev => {
          const updatedMessages = [...prev];
          const typingIndex = updatedMessages.findIndex(m => m.isTyping);
          if (typingIndex !== -1) {
            updatedMessages[typingIndex] = {
              from: 'bot',
              text: fullText,
              isTyping: false
            };
          }
          return updatedMessages;
        });
        setIsWaitingResponse(false);
      }, 10000); // Force complete after 10 seconds max
      
      const typingInterval = setInterval(() => {
        if (charIndex < fullText.length) {
          // Speed up typing for very long responses
          const charsToAdd = fullText.length > 500 ? 3 : 1;
          const endIdx = Math.min(charIndex + charsToAdd, fullText.length);
          
          displayedText += fullText.substring(charIndex, endIdx);
          charIndex = endIdx;
          
          // Update the message with new characters
          setMessages(prev => {
            const updatedMessages = [...prev];
            const typingIndex = updatedMessages.findIndex(m => m.isTyping);
            if (typingIndex !== -1) {
              updatedMessages[typingIndex] = {
                ...updatedMessages[typingIndex],
                text: displayedText
              };
            }
            return updatedMessages;
          });
        } else {
          // Typing finished
          clearInterval(typingInterval);
          // Clear safety timeout since typing completed normally
          clearTimeout(safetyTimeout);
          
          setMessages(prev => {
            const updatedMessages = [...prev];
            const typingIndex = updatedMessages.findIndex(m => m.isTyping);
            if (typingIndex !== -1) {
              updatedMessages[typingIndex] = {
                from: 'bot',
                text: fullText,
                isTyping: false
              };
            }
            return updatedMessages;
          });
          // Reset waiting state when typing is complete
          setIsWaitingResponse(false);
        }
      }, dynamicSpeed); // Dynamic typing speed
        } catch (error) {
      console.log('Error sending message:', error);
      console.log('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      
      // Calculate error response time
      const errorTime = Date.now() - responseStartTime;
      const errorTimeSec = errorTime / 1000;
      
      // Create a more informative error message
      let errorMessage = 'Sorry, there was a problem connecting to the assistant.';
      
      // Special handling for timeout errors - attempt to use basic knowledge about the hotel
      if (error.message && error.message.includes('timeout')) {
        // Look for keywords in the message to provide basic answers
        const msgLower = input.toLowerCase();
        
        if (msgLower.includes('safe') && (msgLower.includes('room') || msgLower.includes('suite'))) {
          errorMessage = "Yes, all guest rooms and suites at Fairmont Tazi Palace are equipped with in-room safes for your valuables.";
        } else if (msgLower.includes('check in') || msgLower.includes('checkin')) {
          errorMessage = "Check-in time begins at 3:00 PM. Early check-in may be available based on room availability.";
        } else if (msgLower.includes('check out') || msgLower.includes('checkout')) {
          errorMessage = "Check-out time is at 12:00 PM (noon). Late check-out may be available upon request.";
        } else if (msgLower.includes('wifi') || msgLower.includes('internet')) {
          errorMessage = "Complimentary high-speed WiFi is available throughout the hotel. The network name is 'Fairmont_Guest' and the password is provided during check-in.";
        } else if (msgLower.includes('spa') || msgLower.includes('massage')) {
          errorMessage = "Our hotel features a luxurious spa with traditional hammam, massage services, and wellness treatments. The spa is open daily from 9:00 AM to 8:00 PM.";
        } else {
          // Generic timeout message if no specific answer could be provided
          errorMessage = `I'm sorry, the response is taking longer than expected. You asked about "${input}". Please try again or contact the front desk for immediate assistance.`;
        }
      } else if (error.message && error.message.includes('Network Error')) {
        errorMessage = 'Network connection error. Please check your internet connection and try again.';
      } else if (error.response && error.response.status === 502) {
        errorMessage = 'The assistant is currently unavailable. Our team has been notified.';
      } else if (error.response && error.response.status) {
        errorMessage = `Server error (${error.response.status}). Please try again or contact support.`;
      }
      
      // Update messages with the error - filter out both loading and typing indicators
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading && !m.isTyping);
        return [...filtered, { 
          from: 'bot', 
          text: errorMessage, 
          isError: true
        }];
      });
      
      // Reset waiting state on error
      setIsWaitingResponse(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <AuthGuard>
        {/* History Modal */}
        <Modal
          visible={showHistory}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowHistory(false)}
        >
          <View style={styles.historyModalOverlay}>
            <View style={styles.historyModalContent}>
              <Text style={styles.historyModalTitle}>Chat History</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {sessions.length === 0 && (
                  <Text style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>No previous chats.</Text>
                )}
                {sessions.map((session) => (
                  <TouchableOpacity
                    key={session.id}
                    style={styles.historySessionItem}
                    onPress={async () => {
                      setShowHistory(false);
                      setCurrentSession(session);
                      try {
                        const msgs = await SessionService.getSessionMessages(session.id);
                        setMessages(msgs);
                      } catch {}
                    }}
                  >
                    <Text style={styles.historySessionTitle}>{session.title || 'Untitled Chat'}</Text>
                    <Text style={styles.historySessionDate}>{session.created_at ? new Date(session.created_at).toLocaleString() : ''}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.historyModalCloseBtn} onPress={() => setShowHistory(false)}>
                <Text style={styles.historyModalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.historyButtonModern}
            onPress={async () => { await fetchSessions(); setShowHistory(true); }}
          >
            <View style={styles.hamburgerIconModern}>
              <View style={styles.hamburgerLineModern} />
              <View style={[styles.hamburgerLineModern, { marginVertical: 3 }]} />
              <View style={styles.hamburgerLineModern} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitleText}>Fairmont Assistant</Text>
          <TouchableOpacity style={styles.profileButtonModern} onPress={handleProfilePress}>
            <View style={styles.profilePhotoModern}>
              <Text style={styles.profilePhotoTextModern}>U</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Chat Area */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{ padding: 16, flexGrow: 1, justifyContent: 'flex-end' }}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.messageRowModern,
                  msg.from === 'user' ? styles.messageRowUserModern : styles.messageRowBotModern
                ]}
              >
                <View
                  style={[
                    styles.messageModern,
                    msg.from === 'user' ? styles.userMsgModern : styles.botMsgModern,
                    msg.isLoading && styles.loadingMsgModern,
                    msg.isError && styles.errorMsgModern
                  ]}
                >
                  <Text
                    style={[
                      styles.msgTextModern,
                      msg.from === 'user' ? styles.userMsgTextModern : styles.botMsgTextModern,
                      msg.isLoading && styles.loadingTextModern
                    ]}
                  >
                    {msg.text}
                  </Text>
                  
                  {/* No response time displayed in UI */}
                  
                  {/* Show typing indicator */}
                  {msg.isTyping && (
                    <Text style={styles.typingIndicator}>typing...</Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputRowModern}>
            <TextInput 
              style={[styles.inputModern, isWaitingResponse && styles.inputDisabled]} 
              value={input} 
              onChangeText={setInput}
              placeholder={isWaitingResponse ? "Waiting for response..." : "Type your message..."} 
              placeholderTextColor={isWaitingResponse ? "#999" : "#B0A89F"}
              multiline={false}
              onSubmitEditing={!isWaitingResponse ? sendMessage : null}
              editable={!isWaitingResponse}
            />
            <TouchableOpacity
              style={[
                styles.sendBtnModern, 
                (!input.trim() || isWaitingResponse) && styles.sendBtnModernDisabled
              ]}
              onPress={sendMessage}
              disabled={!input.trim() || isWaitingResponse}
            >
              <Text style={styles.sendTextModern}>{isWaitingResponse ? "..." : "Send"}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </AuthGuard>
    </SafeAreaView>
  );
}

const BROWN = '#8B7355';

const styles = StyleSheet.create({
  historyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  historyModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 18,
    textAlign: 'center',
  },
  historySessionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EEE9',
  },
  historySessionTitle: {
    fontSize: 16,
    color: '#222',
    fontWeight: '600',
  },
  historySessionDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  historyModalCloseBtn: {
    marginTop: 18,
    backgroundColor: BROWN,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  historyModalCloseText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  historyButtonModern: {
    padding: 8,
    marginRight: 8,
  },
  hamburgerIconModern: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hamburgerLineModern: {
    width: 18,
    height: 2,
    backgroundColor: BROWN,
    borderRadius: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EEE9',
  },
  headerTitleText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginHorizontal: 8,
  },
  profileButtonModern: {
    marginLeft: 10,
  },
  profilePhotoModern: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BROWN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePhotoTextModern: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  messageRowModern: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageRowUserModern: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  messageRowBotModern: {
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  messageModern: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  userMsgModern: {
    backgroundColor: BROWN,
    alignSelf: 'flex-end',
    borderTopRightRadius: 6,
  },
  botMsgModern: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#F0EEE9',
  },
  msgTextModern: {
    fontSize: 17,
    lineHeight: 24,
  },
  userMsgTextModern: {
    color: '#fff',
    fontWeight: '500',
  },
  botMsgTextModern: {
    color: '#222',
    fontWeight: '400',
  },
  inputRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0EEE9',
    backgroundColor: '#FAFAFA',
  },
  inputModern: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0DED9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#222',
  },
  sendBtnModern: {
    backgroundColor: BROWN,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    opacity: 1,
  },
  sendBtnModernDisabled: {
    backgroundColor: '#E0DED9',
    opacity: 0.7,
  },
  sendTextModern: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  loadingMsgModern: {
    backgroundColor: '#f9f5f0',
    borderColor: '#e9e6e0',
    borderStyle: 'dashed',
  },
  errorMsgModern: {
    backgroundColor: '#fff0f0',
    borderColor: '#ffe0e0',
  },
  loadingTextModern: {
    color: '#999',
    fontStyle: 'italic',
  },
  // Removed response time style
  typingIndicator: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
