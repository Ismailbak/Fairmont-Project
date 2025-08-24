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

  const sendMessage = async () => {
    if (!input.trim()) return;
    let session = currentSession;
    if (!session) {
      session = await SessionService.createSession('New Chat');
      setCurrentSession(session);
      setSessions(prev => [session, ...prev]);
    }
    const userMsg = { from: 'user', text: input };
    setMessages(prev => [...prev, userMsg, { from: 'bot', text: '...', isLoading: true }]);
    const userInput = input;
    setInput('');
    try {
      const res = await SessionService.sendMessage(session.id, userInput, 'user');
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        if (res.user_message && res.bot_message) {
          return [
            ...filtered,
            { from: 'user', text: res.user_message.message },
            { from: 'bot', text: res.bot_message.message }
          ];
        } else if (res.response || res.text) {
          return [...filtered, { from: 'bot', text: res.response || res.text || 'No response.' }];
        } else {
          return [...filtered, { from: 'bot', text: 'No response.' }];
        }
      });
    } catch (e) {
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        return [...filtered, { from: 'bot', text: 'Sorry, there was an error.' }];
      });
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
                    msg.from === 'user' ? styles.userMsgModern : styles.botMsgModern
                  ]}
                >
                  <Text
                    style={[
                      styles.msgTextModern,
                      msg.from === 'user' ? styles.userMsgTextModern : styles.botMsgTextModern
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputRowModern}>
            <TextInput 
              style={styles.inputModern} 
              value={input} 
              onChangeText={setInput}
              placeholder="Type your message..." 
              placeholderTextColor="#B0A89F"
              multiline={false}
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity
              style={[styles.sendBtnModern, (!input.trim()) && styles.sendBtnModernDisabled]}
              onPress={sendMessage}
              disabled={!input.trim()}
            >
              <Text style={styles.sendTextModern}>Send</Text>
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
});
