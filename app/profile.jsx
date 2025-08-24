// app/profile.jsx - User profile and admin monitoring screen
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { AuthService } from '../src/services/authService';
import AuthGuard from './components/AuthGuard';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [allActivities, setAllActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdminView, setShowAdminView] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Get current user info
      const userData = await AuthService.getUser();
      setUser(userData);

      // Get user's own activities
      const userActivities = await AuthService.getUserActivities(20);
      setActivities(userActivities);

      // Try to get all activities (admin view)
      try {
        const response = await AuthService.authenticatedFetch('http://localhost:8000/api/admin/user-activities?limit=50');
        if (response.ok) {
          const adminActivities = await response.json();
          setAllActivities(adminActivities);
        }
      } catch (error) {
        console.log('Admin access not available:', error.message);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await AuthService.signout();
            router.replace('/signin');
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <AuthGuard>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B7355" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </SafeAreaView>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
        {/* Header */}
        <View style={styles.profileHeaderRow}>
          <TouchableOpacity style={styles.profileBackBtn} onPress={() => router.back()}>
            <Text style={styles.profileBackArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.profileHeaderTitle}>Settings</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 0 }}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileAvatarCircle}>
              <Text style={styles.profileAvatarText}>
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </Text>
            </View>
            <View>
              <Text style={styles.profileName}>{user?.full_name || 'User Name'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
            </View>
          </View>

          {/* App Settings */}
          <View style={styles.profileSection}>
            <Text style={styles.profileSectionTitle}>App Settings</Text>
            <View style={styles.profileSettingRow}>
              <Text style={styles.profileSettingLabel}>Push Notifications</Text>
              <View style={styles.profileSwitch} />
            </View>
            <Text style={styles.profileSettingSub}>Receive chat notifications</Text>
            <View style={styles.profileSettingRow}>
              <Text style={styles.profileSettingLabel}>Dark Mode</Text>
              <View style={[styles.profileSwitch, { backgroundColor: '#E0DED9' }]} />
            </View>
            <Text style={styles.profileSettingSub}>Use dark theme</Text>
          </View>

          {/* Account Section */}
          <View style={styles.profileSection}>
            <Text style={styles.profileSectionTitle}>Account</Text>
            <TouchableOpacity style={styles.profileLinkRow}>
              <Text style={styles.profileLinkText}>Change Password</Text>
              <Text style={styles.profileLinkArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileLinkRow}>
              <Text style={styles.profileLinkText}>Privacy Policy</Text>
              <Text style={styles.profileLinkArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileLinkRow}>
              <Text style={styles.profileLinkText}>Terms of Service</Text>
              <Text style={styles.profileLinkArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Out */}
          <TouchableOpacity style={styles.profileSignOutBtn} onPress={handleSignOut}>
            <Text style={styles.profileSignOutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },

  /* Profile Header */
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    justifyContent: 'space-between',
  },
  profileBackBtn: {
    width: 32,
  },
  profileBackArrow: {
    fontSize: 24,
    color: '#8B7355',
  },
  profileHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c2c2c',
  },

  /* Profile Card */
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    margin: 12,
  },
  profileAvatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8B7355',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c2c2c',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6c757d',
  },

  /* Sections */
  profileSection: {
    backgroundColor: '#fff',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  profileSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c2c2c',
    marginBottom: 8,
  },
  profileSettingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  profileSettingLabel: {
    fontSize: 16,
    color: '#2c2c2c',
  },
  profileSwitch: {
    width: 40,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  profileSettingSub: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 4,
    marginBottom: 8,
  },
  profileLinkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  profileLinkText: {
    fontSize: 16,
    color: '#2c2c2c',
  },
  profileLinkArrow: {
    fontSize: 18,
    color: '#6c757d',
  },

  /* Sign Out */
  profileSignOutBtn: {
    margin: 16,
    backgroundColor: '#dc3545',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  profileSignOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
