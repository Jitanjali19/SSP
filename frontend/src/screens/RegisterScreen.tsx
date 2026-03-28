import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput, Button, Card, Title, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

type RegisterRole = 'SUPER_ADMIN' | 'ADMIN' | 'VENDOR' | 'PATIENT';

const roleOptions: RegisterRole[] = ['SUPER_ADMIN', 'ADMIN', 'VENDOR', 'PATIENT'];

const roleLabels: Record<RegisterRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  VENDOR: 'Vendor',
  PATIENT: 'Patient',
};

const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const { login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RegisterRole>('PATIENT');
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePhone = (value: string) => /^\d{10}$/.test(value);

  const handleRegister = async () => {
    setValidationError('');

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password.trim() || !role) {
      setValidationError('Please fill all required fields.');
      return;
    }

    if (!validateEmail(email.trim())) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    if (!validatePhone(phone.trim())) {
      setValidationError('Phone must be a 10-digit number.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
      };

      const res = await authAPI.register(payload);

      await login(res);

      navigation.reset({
        index: 0,
        routes: [{ name: 'Main', params: { role: res.user.role } }],
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Registration failed. Please try again.';
      setValidationError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRole = (selectedRole: RegisterRole) => {
    setRole(selectedRole);
    setRoleModalVisible(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>Create Account</Title>
              <Text style={styles.subtitle}>Register to continue</Text>

              <TextInput
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="account-outline" />}
              />

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="email-outline" />}
              />

              <TextInput
                label="Phone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="phone-outline" />}
                maxLength={10}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="lock-outline" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />

              <Text style={styles.roleLabel}>Role</Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setRoleModalVisible(true)}
                style={styles.roleSelector}
              >
                <View style={styles.roleSelectorInner}>
                  <Text style={styles.roleSelectorText}>{roleLabels[role]}</Text>
                  <Text style={styles.roleArrow}>▼</Text>
                </View>
              </TouchableOpacity>

              {validationError ? <Text style={styles.errorText}>{validationError}</Text> : null}

              <Button
                mode="contained"
                onPress={handleRegister}
                loading={isLoading}
                disabled={isLoading}
                style={styles.registerButton}
                contentStyle={styles.registerButtonContent}
              >
                Register
              </Button>

              <Button mode="text" onPress={() => navigation.navigate('Login')} style={styles.loginButton}>
                Already have account? Login
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      <Modal
        visible={roleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setRoleModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Select Role</Text>

            {roleOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.roleOption,
                  role === option && styles.roleOptionSelected,
                ]}
                onPress={() => handleSelectRole(option)}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    role === option && styles.roleOptionTextSelected,
                  ]}
                >
                  {roleLabels[option]}
                </Text>
              </TouchableOpacity>
            ))}

            <Button mode="text" onPress={() => setRoleModalVisible(false)}>
              Cancel
            </Button>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#f3f5f9',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 18,
    paddingVertical: 10,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 4,
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 18,
    color: '#666',
    fontSize: 14,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  roleLabel: {
    marginTop: 6,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  roleSelector: {
    borderWidth: 1,
    borderColor: '#bfc8d6',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginBottom: 14,
  },
  roleSelectorInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleSelectorText: {
    fontSize: 15,
    color: '#222',
  },
  roleArrow: {
    fontSize: 14,
    color: '#555',
  },
  errorText: {
    color: '#b00020',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 13,
  },
  registerButton: {
    marginTop: 4,
    borderRadius: 10,
  },
  registerButtonContent: {
    paddingVertical: 6,
  },
  loginButton: {
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
  },
  roleOption: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#f5f7fb',
  },
  roleOptionSelected: {
    backgroundColor: '#dfe9ff',
    borderWidth: 1,
    borderColor: '#4a74f5',
  },
  roleOptionText: {
    fontSize: 15,
    color: '#222',
  },
  roleOptionTextSelected: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
});