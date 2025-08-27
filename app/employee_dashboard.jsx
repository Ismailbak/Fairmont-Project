


import { useEffect, useState } from 'react';
import { EmployeeService } from '../src/services/employeeService';
import { SafeAreaView, ScrollView, Text, View, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({ name: '', email: '' });
  const [actionLoading, setActionLoading] = useState({});

  // Fetch data function for reuse
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksData, eventsData, meetingsData] = await Promise.all([
        EmployeeService.getTasks(),
        EmployeeService.getEvents(),
        EmployeeService.getMeetings()
      ]);
      setTasks(tasksData);
      setEvents(eventsData);
      setMeetings(meetingsData);
      console.log('Fetched tasks:', tasksData);
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user_data');
        if (userStr) {
          const userObj = JSON.parse(userStr);
          console.log('Loaded user from AsyncStorage:', userObj);
          setUser({ name: userObj.full_name || userObj.name || '', email: userObj.email || '' });
        }
      } catch {}
    };
    fetchUser();
    fetchData();
  }, []);

  // Personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Next meeting highlight
  const nextMeeting = meetings && meetings.length > 0 ? meetings[0] : null;

  // Filtered tasks for display (not completed & approved)
  const filteredTasks = tasks.filter(task => !(task.completed === 1 && task.pending_approval === 0));
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.completed).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F4F0' }}>
      {/* Header Bar with Avatar */}
      <View style={styles.headerBar}>
        <Text style={{position:'absolute',top:10,left:'50%',transform:[{translateX:-80}],fontSize:22,fontWeight:'700',color:'#8B7355',zIndex:-1}}>
          {user.name ? `${user.name.split(' ')[0]}'s Dashboard` : 'Employee Dashboard'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.7}>
            <View style={[styles.avatar, {backgroundColor: '#E0D6C3', justifyContent: 'center', alignItems: 'center'}]}>
              <Text style={{fontSize: 28, color: '#8B7355', fontWeight: 'bold'}}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'E'}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerBarBtn} onPress={() => router.replace('/signin')}>
          <Text style={styles.headerBarBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Motivational message */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationText}>
            {`Welcome back${user.name ? ', ' + user.name.split(' ')[0] : ''}! Let's make today productive.`}
          </Text>
        </View>
        {/* Next Meeting Highlight */}
        {nextMeeting && (
          <View style={styles.nextMeetingCard}>
            <Text style={styles.nextMeetingTitle}>Next Meeting</Text>
            <Text style={styles.nextMeetingName}>{nextMeeting.title}</Text>
            <Text style={styles.nextMeetingTime}>Time: {nextMeeting.time}</Text>
          </View>
        )}
        {loading && <Text style={styles.loadingText}>Loading...</Text>}
        {error && <Text style={styles.errorText}>{error}</Text>}
        {!loading && !error && <>
          {/* Task Progress Bar */}
          <View style={styles.sectionCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={styles.sectionTitle}>📝 Your Tasks</Text>
              {totalTasks > 0 && (
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${(completedTasks/totalTasks)*100 || 0}%` }]} />
                </View>
              )}
              {totalTasks > 0 && (
                <Text style={styles.progressText}>{completedTasks}/{totalTasks}</Text>
              )}
            </View>
            {filteredTasks.length === 0 && <Text style={styles.cardSubtitle}>No tasks assigned.</Text>}
            {filteredTasks.map(task => (
              <View key={task.id} style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.taskIcon}><Text style={{ color: '#fff', fontWeight: 'bold' }}>✓</Text></View>
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.cardTitle}>{task.title}</Text>
                      <Text style={styles.cardSubtitle}>Due: {task.due}</Text>
                    </View>
                  </View>
                  {(task.completed === 1 && task.pending_approval === 1) ? (
                    <Text style={{ color: '#F7C873', fontWeight: 'bold', fontSize: 13 }}>Pending Approval</Text>
                  ) : task.completed === 1 ? (
                    <Text style={{ color: '#3B6E22', fontWeight: 'bold', fontSize: 13 }}>Done</Text>
                  ) : (
                    <TouchableOpacity
                      style={styles.minimalBtn}
                      disabled={!!actionLoading[`task_${task.id}`]}
                      onPress={async () => {
                        setActionLoading(l => ({ ...l, [`task_${task.id}`]: true }));
                        try {
                          await EmployeeService.markTaskDone(task.id);
                          setTasks(ts => {
                            const updated = ts.map(t => t.id === task.id ? { ...t, completed: 1, pending_approval: 1 } : t);
                            console.log('Tasks after marking done:', updated);
                            return updated;
                          });
                        } catch (e) {
                          setError('Failed to mark task as done');
                        } finally {
                          setActionLoading(l => ({ ...l, [`task_${task.id}`]: false }));
                        }
                      }}
                    >
                      {actionLoading[`task_${task.id}`] ? <ActivityIndicator size="small" color="#8B7355" /> : <Text style={styles.minimalBtnText}>Done</Text>}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>📅 Upcoming Events</Text>
            {events.length === 0 && <Text style={styles.cardSubtitle}>No events.</Text>}
            {events.map(event => (
              <View key={event.id} style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.eventIcon}><Text style={{ color: '#fff', fontWeight: 'bold' }}>★</Text></View>
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.cardTitle}>{event.title}</Text>
                      <Text style={styles.cardSubtitle}>Date: {event.date}</Text>
                    </View>
                  </View>
                  {event.rsvped ? (
                    <Text style={{ color: '#3B6E22', fontWeight: 'bold', fontSize: 13 }}>RSVPed</Text>
                  ) : (
                    <TouchableOpacity
                      style={styles.minimalBtn}
                      disabled={!!actionLoading[`event_${event.id}`]}
                      onPress={async () => {
                        setActionLoading(l => ({ ...l, [`event_${event.id}`]: true }));
                        try {
                          await EmployeeService.rsvpEvent(event.id);
                          setEvents(ev => ev.map(e => e.id === event.id ? { ...e, rsvped: 1 } : e));
                        } catch (e) {
                          setError('Failed to RSVP to event');
                        } finally {
                          setActionLoading(l => ({ ...l, [`event_${event.id}`]: false }));
                        }
                      }}
                    >
                      {actionLoading[`event_${event.id}`] ? <ActivityIndicator size="small" color="#8B7355" /> : <Text style={styles.minimalBtnText}>RSVP</Text>}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🤝 Meetings</Text>
            {meetings.length === 0 && <Text style={styles.cardSubtitle}>No meetings.</Text>}
            {meetings.map(meeting => (
              <View key={meeting.id} style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.meetingIcon}><Text style={{ color: '#fff', fontWeight: 'bold' }}>⏰</Text></View>
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.cardTitle}>{meeting.title}</Text>
                      <Text style={styles.cardSubtitle}>Time: {meeting.time}</Text>
                    </View>
                  </View>
                  {meeting.rsvped ? (
                    <Text style={{ color: '#3B6E22', fontWeight: 'bold', fontSize: 13 }}>RSVPed</Text>
                  ) : (
                    <TouchableOpacity
                      style={styles.minimalBtn}
                      disabled={!!actionLoading[`meeting_${meeting.id}`]}
                      onPress={async () => {
                        setActionLoading(l => ({ ...l, [`meeting_${meeting.id}`]: true }));
                        try {
                          await EmployeeService.rsvpMeeting(meeting.id);
                          setMeetings(ms => ms.map(m => m.id === meeting.id ? { ...m, rsvped: 1 } : m));
                        } catch (e) {
                          setError('Failed to RSVP to meeting');
                        } finally {
                          setActionLoading(l => ({ ...l, [`meeting_${meeting.id}`]: false }));
                        }
                      }}
                    >
                      {actionLoading[`meeting_${meeting.id}`] ? <ActivityIndicator size="small" color="#8B7355" /> : <Text style={styles.minimalBtnText}>RSVP</Text>}
                    </TouchableOpacity>
                  )}
                </View>
              </View>

            ))}
          </View>
        </>}
        {/* Manual refresh button */}
        <TouchableOpacity onPress={fetchData} style={{ marginTop: 16, alignSelf: 'center', backgroundColor: '#8B7355', padding: 10, borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Refresh Tasks</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  minimalBtn: {
    backgroundColor: '#fff',
    borderColor: '#8B7355',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft: 10,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  minimalBtnText: {
    color: '#8B7355',
    fontWeight: 'bold',
    fontSize: 13,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EEE9',
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F6F4F0',
    borderWidth: 1,
    borderColor: '#E5E3DF',
  },
  greeting: {
    fontSize: 15,
    color: '#8B7355',
    fontWeight: '500',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerBarBtn: {
    backgroundColor: '#8B7355',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  headerBarBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scrollContainer: {
    padding: 18,
    paddingBottom: 32,
  },
  motivationCard: {
    backgroundColor: '#E9F5E1',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    alignItems: 'center',
  },
  motivationText: {
    color: '#3B6E22',
    fontSize: 16,
    fontWeight: '600',
  },
  nextMeetingCard: {
    backgroundColor: '#FDF6E3',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    borderLeftWidth: 5,
    borderLeftColor: '#F7C873',
  },
  nextMeetingTitle: {
    color: '#8B7355',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 4,
  },
  nextMeetingName: {
    color: '#1f2937',
    fontWeight: '700',
    fontSize: 17,
    marginBottom: 2,
  },
  nextMeetingTime: {
    color: '#6c757d',
    fontSize: 14,
  },
  loadingText: {
    fontSize: 16,
    color: '#8B7355',
    textAlign: 'center',
    marginTop: 40,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#8B7355',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    width: 60,
    backgroundColor: '#F0EEE9',
    borderRadius: 4,
    marginLeft: 10,
    marginRight: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#8B7355',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#8B7355',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#f8f6f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  taskIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B7355',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F7C873',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meetingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B6E22',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
