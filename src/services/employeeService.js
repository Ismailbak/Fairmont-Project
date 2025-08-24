import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../config';

export const EmployeeService = {
  async getTasks() {
    const token = await AsyncStorage.getItem('auth_token');
    const res = await fetch(getApiUrl('/api/employee/tasks'), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return await res.json();
  },
  async getEvents() {
    const token = await AsyncStorage.getItem('auth_token');
    const res = await fetch(getApiUrl('/api/employee/events'), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch events');
    return await res.json();
  },
  async getMeetings() {
    const token = await AsyncStorage.getItem('auth_token');
    const res = await fetch(getApiUrl('/api/employee/meetings'), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch meetings');
    return await res.json();
  }
};
