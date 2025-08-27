import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { AuthService } from '../src/services/authService';
import { getApiUrl } from '../src/config';

export default function DebugScreen() {
  const [tokenInfo, setTokenInfo] = useState({
    exists: false,
    preview: '',
    tokenData: null
  });
  const [userInfo, setUserInfo] = useState(null);
  const [lastApiResponse, setLastApiResponse] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check token
      const token = await AuthService.getToken();
      const exists = !!token;
      const preview = token ? `${token.substring(0, 15)}...` : 'None';
      
      // Try to decode token (without verification)
      let tokenData = null;
      if (token) {
        try {
          // This just shows the payload without verification
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          tokenData = JSON.parse(jsonPayload);
        } catch (e) {
          tokenData = { error: 'Could not decode token' };
        }
      }
      
      setTokenInfo({ exists, preview, tokenData });
      
      // Get user info
      const user = await AuthService.getUser();
      setUserInfo(user);
      
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const testApiCall = async () => {
    try {
      const token = await AuthService.getToken();
      const response = await fetch(getApiUrl('/api/session/list'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const statusCode = response.status;
      const responseText = await response.text();
      let responseJson = null;
      
      try {
        responseJson = JSON.parse(responseText);
      } catch (e) {
        // Not JSON
      }
      
      setLastApiResponse({
        status: statusCode,
        isJson: !!responseJson,
        text: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''),
        json: responseJson
      });
      
    } catch (error) {
      setLastApiResponse({
        error: error.message
      });
    }
  };

  const refreshToken = async () => {
    try {
      // For simplicity, just re-login
      Alert.alert(
        'Re-login Required',
        'This debug function requires a full re-login. You would need to implement a proper token refresh mechanism in your app.',
        [
          { text: 'OK', style: 'default' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const logout = async () => {
    try {
      await AuthService.signout();
      checkAuthStatus();
      Alert.alert('Success', 'Logged out successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Auth Debug Information</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Authentication Status</Text>
        <Text>Token exists: {tokenInfo.exists ? 'Yes' : 'No'}</Text>
        <Text>Token preview: {tokenInfo.preview}</Text>
        
        {tokenInfo.tokenData && (
          <View style={styles.jsonData}>
            <Text style={styles.jsonTitle}>Token payload:</Text>
            <Text>{JSON.stringify(tokenInfo.tokenData, null, 2)}</Text>
            
            {tokenInfo.tokenData.exp && (
              <Text style={styles.expiry}>
                Expires: {new Date(tokenInfo.tokenData.exp * 1000).toLocaleString()}
                {'\n'}
                {new Date(tokenInfo.tokenData.exp * 1000) < new Date() ? 
                  '⚠️ TOKEN EXPIRED ⚠️' : 
                  `Valid for ${Math.round((new Date(tokenInfo.tokenData.exp * 1000) - new Date()) / 60000)} more minutes`
                }
              </Text>
            )}
          </View>
        )}
        
        {userInfo && (
          <View style={styles.jsonData}>
            <Text style={styles.jsonTitle}>User data:</Text>
            <Text>{JSON.stringify(userInfo, null, 2)}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={checkAuthStatus}>
          <Text style={styles.buttonText}>Refresh Status</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testApiCall}>
          <Text style={styles.buttonText}>Test API Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.warningButton]} onPress={refreshToken}>
          <Text style={styles.buttonText}>Refresh Token</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={logout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      {lastApiResponse && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last API Response</Text>
          <Text>Status: {lastApiResponse.status}</Text>
          {lastApiResponse.error ? (
            <Text style={styles.error}>Error: {lastApiResponse.error}</Text>
          ) : (
            <>
              <Text>Is JSON: {lastApiResponse.isJson ? 'Yes' : 'No'}</Text>
              <Text style={styles.responseText}>{lastApiResponse.text}</Text>
              
              {lastApiResponse.json && (
                <View style={styles.jsonData}>
                  <Text style={styles.jsonTitle}>Response JSON:</Text>
                  <Text>{JSON.stringify(lastApiResponse.json, null, 2)}</Text>
                </View>
              )}
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  jsonData: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  jsonTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  expiry: {
    marginTop: 10,
    color: 'blue',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    minWidth: '48%',
    marginBottom: 10,
    alignItems: 'center',
  },
  warningButton: {
    backgroundColor: '#ffc107',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  responseText: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    fontFamily: 'monospace',
  },
  error: {
    color: 'red',
    marginTop: 5,
  }
});
