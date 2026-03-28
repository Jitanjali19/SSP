import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { patientAPI } from '../services/api';
import { Patient } from '../types';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Patient | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const data = await patientAPI.getProfile(user.id);
      setProfile(data);
    } catch (error) {
      // Handle error
    }
  };

  if (!profile) {
    return <Paragraph>Loading...</Paragraph>;
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Profile</Title>
          <Paragraph>Name: {profile.firstName} {profile.lastName}</Paragraph>
          <Paragraph>Phone: {profile.phone}</Paragraph>
          <Paragraph>Status: {profile.registrationStatus}</Paragraph>
          {profile.qrCodeValue && <Paragraph>QR Code: {profile.qrCodeValue}</Paragraph>}
        </Card.Content>
      </Card>
      <Button mode="contained" style={styles.button}>
        View Reports
      </Button>
      <Button mode="outlined" style={styles.button}>
        Next Due Date
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    elevation: 4,
    marginBottom: 20,
  },
  button: {
    marginVertical: 10,
  },
});

export default PatientDashboard;