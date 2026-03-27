import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, LoginRequest, Patient, EligibilityCheck, QuestionnaireResponse } from '../types';

const API_BASE_URL = 'http://localhost:5000/api'; // Adjust to your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data.data;
  },

  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },
};

export const patientAPI = {
  register: async (data: any): Promise<Patient> => {
    const response = await api.post('/patients/register', data);
    return response.data.data;
  },

  getById: async (id: string): Promise<Patient> => {
    const response = await api.get(`/patients/${id}`);
    return response.data.data;
  },

  getByQR: async (qrCode: string): Promise<Patient> => {
    const response = await api.get(`/patients/qr/${qrCode}`);
    return response.data.data;
  },

  getProfile: async (id: string): Promise<Patient> => {
    const response = await api.get(`/patients/${id}/profile`);
    return response.data.data;
  },

  generateQR: async (id: string): Promise<{ qrCode: string }> => {
    const response = await api.post(`/patients/${id}/generate-qr`);
    return response.data.data;
  },
};

export const eligibilityAPI = {
  check: async (patientId: string): Promise<EligibilityCheck> => {
    const response = await api.get(`/eligibility/${patientId}`);
    return response.data.data;
  },
};

export const questionnaireAPI = {
  submit: async (patientId: string, data: QuestionnaireResponse) => {
    const response = await api.post(`/patients/${patientId}/questionnaire`, data);
    return response.data.data;
  },
};

// Add more APIs as needed for camps, reports, etc.

export default api;