import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation', 'Please enter both email and password.');
      return;
    }

    try {
      const res = await authAPI.login({ email, password });
      await login(res);

      const normalizedRole = res.user.role?.toUpperCase();

      navigation.reset({
        index: 0,
        routes: [{ name: 'Main', params: { role: normalizedRole } }],
      });
    } catch (e: any) {
      console.log(e?.response?.data || e);
      const message = e?.response?.data?.message || 'Login failed. Please check your credentials.';
      Alert.alert('Login Failed', message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput label="Email" value={email} onChangeText={setEmail} />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />

      <Button mode="contained" onPress={handleLogin}>Login</Button>

      <Button onPress={() => navigation.navigate("Register")}>
        Register
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 }
});