import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, UserRole, Patient } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.43.214:5002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const payload = { email: data.email.trim(), password: data.password };
    console.log('API Request: /auth/login', payload);
    const res = await api.post('/auth/login', payload);
    console.log('API Response: /auth/login', res.status, res.data);
    return res.data.data;
  },

  register: async (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
  }): Promise<AuthResponse> => {
    const payload = {
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      password: data.password,
      role: data.role.toUpperCase(),
    };
    console.log('API Request: /auth/register', payload);
    const res = await api.post('/auth/register', payload);
    console.log('API Response: /auth/register', res.status, res.data);
    return res.data.data;
  },
};

export const patientAPI = {
  getByQR: async (qr: string): Promise<Patient> => {
    const normalizedQR = qr.trim();
    console.log('API Request: /patients/qr', normalizedQR);
    const res = await api.get(`/patients/qr/${encodeURIComponent(normalizedQR)}`);
    console.log('API Response: /patients/qr', res.status, res.data);
    return res.data.data;
  },

  getProfile: async (id: string): Promise<Patient> => {
    const normalizedId = id.trim();
    console.log('API Request: /patients/' + normalizedId + '/profile');
    const res = await api.get(`/patients/${normalizedId}/profile`);
    console.log('API Response: /patients/:id/profile', res.status, res.data);
    return res.data.data;
  },
};

export default api;