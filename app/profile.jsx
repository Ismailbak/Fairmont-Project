// app/profile.jsx - User profile and admin monitoring screen
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { AuthService } from './services/authService';
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
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile & Activity</Text>
          </View>

          {/* User Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Information</Text>
            <View style={styles.userCard}>
              <View style={styles.userAvatar}>
                <Text style={styles.userInitial}>
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <Text style={styles.userId}>User ID: {user?.id}</Text>
              </View>
            </View>
          </View>

          {/* View Toggle */}
          <View style={styles.section}>
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[styles.toggleButton, !showAdminView && styles.toggleButtonActive]}
                onPress={() => setShowAdminView(false)}
              >
                <Text style={[styles.toggleText, !showAdminView && styles.toggleTextActive]}>
                  My Activities
                </Text>
              </TouchableOpacity>
              {allActivities.length > 0 && (
                <TouchableOpacity 
                  style={[styles.toggleButton, showAdminView && styles.toggleButtonActive]}
                  onPress={() => setShowAdminView(true)}
                >
                  <Text style={[styles.toggleText, showAdminView && styles.toggleTextActive]}>
                    All Users (Admin)
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Activities Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {showAdminView ? 'All User Activities (Admin View)' : 'My Recent Activities'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {showAdminView ? 
                `Monitoring ${allActivities.length} activities from all users` : 
                `Your last ${activities.length} activities`
              }
            </Text>
            
            {(showAdminView ? allActivities : activities).map((activity, index) => (
              <View key={index} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityAction}>{activity.action}</Text>
                  <Text style={styles.activityDate}>{formatDate(activity.timestamp)}</Text>
                </View>
                {showAdminView && (
                  <Text style={styles.activityUser}>User: {activity.user_name}</Text>
                )}
                {activity.endpoint && (
                  <Text style={styles.activityEndpoint}>Endpoint: {activity.endpoint}</Text>
                )}
                {activity.ip_address && (
                  <Text style={styles.activityIP}>IP: {activity.ip_address}</Text>
                )}
                {activity.details && (
                  <Text style={styles.activityDetails}>{activity.details}</Text>
                )}
              </View>
            ))}
          </View>

          {/* Actions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/chatbot_protected')}>
              <Text style={styles.actionButtonText}>Go to Chat</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={loadUserData}>
              <Text style={styles.actionButtonText}>Refresh Data</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, styles.signOutButton]} onPress={handleSignOut}>
              <Text style={[styles.actionButtonText, styles.signOutButtonText]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#8B7355',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c2c2c',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c2c2c',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8B7355',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInitial: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c2c2c',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  userId: {
    fontSize: 12,
    color: '#adb5bd',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#8B7355',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  toggleTextActive: {
    color: '#fff',
  },
  activityCard: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#8B7355',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityAction: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c2c2c',
    textTransform: 'capitalize',
  },
  activityDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  activityUser: {
    fontSize: 14,
    color: '#8B7355',
    fontWeight: '500',
    marginBottom: 2,
  },
  activityEndpoint: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  activityIP: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  activityDetails: {
    fontSize: 12,
    color: '#495057',
    fontStyle: 'italic',
  },
  actionButton: {
    backgroundColor: '#8B7355',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
  },
  signOutButtonText: {
    color: '#fff',
  },
});
