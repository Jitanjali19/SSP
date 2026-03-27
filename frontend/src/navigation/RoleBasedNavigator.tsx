import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

// Import screens
import AdminDashboard from '../screens/AdminDashboard';
import VendorDashboard from '../screens/VendorDashboard';
import DoctorDashboard from '../screens/DoctorDashboard';
import FieldStaffDashboard from '../screens/FieldStaffDashboard';
import PatientDashboard from '../screens/PatientDashboard';
import QRScanner from '../screens/QRScanner';
import PatientForm from '../screens/PatientForm';

const Stack = createStackNavigator();

const RoleBasedNavigator: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const renderScreens = () => {
    const commonScreens = (
      <>
        <Stack.Screen name="QRScanner" component={QRScanner} />
        <Stack.Screen name="PatientForm" component={PatientForm} />
      </>
    );

    switch (user.role) {
      case 'ADMIN':
        return (
          <>
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            {commonScreens}
          </>
        );
      case 'VENDOR':
        return (
          <>
            <Stack.Screen name="VendorDashboard" component={VendorDashboard} />
            {commonScreens}
          </>
        );
      case 'DOCTOR':
        return (
          <>
            <Stack.Screen name="DoctorDashboard" component={DoctorDashboard} />
            {commonScreens}
          </>
        );
      case 'FIELD_STAFF':
        return (
          <>
            <Stack.Screen name="FieldStaffDashboard" component={FieldStaffDashboard} />
            {commonScreens}
          </>
        );
      case 'PATIENT':
        return (
          <>
            <Stack.Screen name="PatientDashboard" component={PatientDashboard} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {renderScreens()}
    </Stack.Navigator>
  );
};

export default RoleBasedNavigator;