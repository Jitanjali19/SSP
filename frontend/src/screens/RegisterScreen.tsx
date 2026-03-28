import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Card, Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const allowedRoles: UserRole[] = ['PATIENT', 'VENDOR'];

const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const { login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('PATIENT');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePhone = (value: string) => /^\d{10}$/.test(value);

  const handleRegister = async () => {
    if (!fullName || !email || !phone || !password || !role) {
      Alert.alert('Validation', 'Please fill all required fields.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Validation', 'Please enter a valid email address.');
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert('Validation', 'Phone must be a 10-digit number.');
      return;
    }

    setIsLoading(true);
    try {
      if (!allowedRoles.includes(role)) {
        throw new Error('Registration allowed only for Patient or Vendor roles.');
      }

      const body = { fullName, email, phone, password, role: role.toUpperCase() };
      console.log('Register request', body);
      const res = await authAPI.register(body);
      console.log('Register response', res);

      await login(res);
      navigation.reset({ index: 0, routes: [{ name: 'Main', params: { role: role.toUpperCase() } }] });
    } catch (error: any) {
      console.log('Register error', error?.response?.data || error);
      const message = error?.response?.data?.message || error?.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Register</Title>

          <TextInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <TextInput
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <Title style={{ marginTop: 10, marginBottom: 8 }}>Select Role</Title>
          <View style={styles.roleButtonRow}>
            {allowedRoles.map((option) => (
              <Button
                key={option}
                mode={role === option ? 'contained' : 'outlined'}
                onPress={() => setRole(option)}
                style={styles.roleButton}
              >
                {option === 'PATIENT' ? 'Patient' : 'Vendor'}
              </Button>
            ))}
          </View>

          <Button mode="contained" onPress={handleRegister} loading={isLoading} disabled={isLoading}>
            Register
          </Button>

          <Button onPress={() => navigation.navigate('Login' as never)}>
            Already have account? Login
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { padding: 10 },
  title: { textAlign: 'center', marginBottom: 10 },
  input: { marginBottom: 10 },
  roleButtonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  roleButton: { flex: 1, marginHorizontal: 5 },
});