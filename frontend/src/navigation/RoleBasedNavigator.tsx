import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

import AdminDashboard from '../screens/AdminDashboard';
import VendorDashboard from '../screens/VendorDashboard';
import FieldStaffDashboard from '../screens/FieldStaffDashboard';
import DoctorDashboard from '../screens/DoctorDashboard';
import PatientDashboard from '../screens/PatientDashboard';
import QRScanner from '../screens/QRScanner';
import PatientForm from '../screens/PatientForm';

type RootStackParamList = {
  AdminDashboard: undefined;
  VendorDashboard: undefined;
  FieldStaffDashboard: undefined;
  DoctorDashboard: undefined;
  PatientDashboard: undefined;
  QRScanner: undefined;
  PatientForm: { patient?: any } | undefined;
};

type MainRouteProp = RouteProp<{ Main: { role?: UserRole } }, 'Main'>;

const Stack = createStackNavigator<RootStackParamList>();

const roleToInitialScreen: Record<UserRole, keyof RootStackParamList> = {
  SUPER_ADMIN: 'AdminDashboard',
  ADMIN: 'AdminDashboard',
  VENDOR: 'VendorDashboard',
  FIELD_STAFF: 'FieldStaffDashboard',
  DOCTOR: 'DoctorDashboard',
  PATIENT: 'PatientDashboard',
};

export default function RoleBasedNavigator() {
  const { user } = useAuth();
  const route = useRoute<MainRouteProp>();

  if (!user) return null;

  const normalizedRole = (user.role || 'PATIENT').toUpperCase() as UserRole;
  const requestedRole = route.params?.role ? (route.params.role.toUpperCase() as UserRole) : undefined;
  const effectiveRole = requestedRole && roleToInitialScreen[requestedRole] ? requestedRole : normalizedRole;
  const startScreen = roleToInitialScreen[effectiveRole] || 'PatientDashboard';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={startScreen}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="VendorDashboard" component={VendorDashboard} />
      <Stack.Screen name="FieldStaffDashboard" component={FieldStaffDashboard} />
      <Stack.Screen name="DoctorDashboard" component={DoctorDashboard} />
      <Stack.Screen name="PatientDashboard" component={PatientDashboard} />
      <Stack.Screen name="QRScanner" component={QRScanner} />
      <Stack.Screen name="PatientForm" component={PatientForm} />
    </Stack.Navigator>
  );
}