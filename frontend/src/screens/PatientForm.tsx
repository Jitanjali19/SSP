import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card, Title, RadioButton, Text } from 'react-native-paper';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Patient, EligibilityCheck, QuestionnaireResponse } from '../types';
import { eligibilityAPI, questionnaireAPI } from '../services/api';

type RouteParams = {
  patient: Patient;
  qrCode?: string;
};

const PatientForm: React.FC = () => {
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const navigation = useNavigation();
  const { patient, qrCode } = route.params || {};

  const [eligibility, setEligibility] = useState<EligibilityCheck | null>(null);
  const [tier, setTier] = useState<'TIER_0' | 'TIER_1' | 'TIER_2'>('TIER_0');
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      checkEligibility();
    }
  }, [patient]);

  const checkEligibility = async () => {
    if (!patient) return;
    try {
      const result = await eligibilityAPI.check(patient.id);
      setEligibility(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to check eligibility');
    }
  };

  const handleSubmit = async () => {
    if (!patient) return;
    setLoading(true);
    try {
      const data: QuestionnaireResponse = {
        tier,
        responses,
      };
      await questionnaireAPI.submit(patient.id, data);
      Alert.alert('Success', 'Form submitted successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const renderTierForm = () => {
    switch (tier) {
      case 'TIER_0':
        return (
          <View>
            <TextInput
              label="TB Symptoms"
              value={responses.tbSymptoms || ''}
              onChangeText={(value) => setResponses({ ...responses, tbSymptoms: value })}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Anemia Level"
              value={responses.anemia || ''}
              onChangeText={(value) => setResponses({ ...responses, anemia: value })}
              mode="outlined"
              style={styles.input}
            />
          </View>
        );
      case 'TIER_1':
        return (
          <View>
            <TextInput
              label="Blood Pressure"
              value={responses.bp || ''}
              onChangeText={(value) => setResponses({ ...responses, bp: value })}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Diabetes Level"
              value={responses.diabetes || ''}
              onChangeText={(value) => setResponses({ ...responses, diabetes: value })}
              mode="outlined"
              style={styles.input}
            />
          </View>
        );
      case 'TIER_2':
        return (
          <View>
            <TextInput
              label="Mental Health Assessment"
              value={responses.mentalHealth || ''}
              onChangeText={(value) => setResponses({ ...responses, mentalHealth: value })}
              mode="outlined"
              multiline
              style={styles.input}
            />
          </View>
        );
      default:
        return null;
    }
  };

  if (!patient) {
    return <Text>No patient data</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Patient: {patient.fullName}</Title>
          <Text>Phone: {patient.phone}</Text>
          {eligibility && (
            <Text>Eligible: {eligibility.isEligible ? 'Yes' : 'No'}</Text>
          )}

          <Title style={styles.sectionTitle}>Select Tier</Title>
          <RadioButton.Group onValueChange={value => setTier(value as any)} value={tier}>
            <View style={styles.radioRow}>
              <RadioButton value="TIER_0" />
              <Text>Tier 0 (TB, Anemia)</Text>
            </View>
            <View style={styles.radioRow}>
              <RadioButton value="TIER_1" />
              <Text>Tier 1 (BP, Diabetes)</Text>
            </View>
            <View style={styles.radioRow}>
              <RadioButton value="TIER_2" />
              <Text>Tier 2 (Mental Health)</Text>
            </View>
          </RadioButton.Group>

          <Title style={styles.sectionTitle}>Form</Title>
          {renderTierForm()}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Submit
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
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
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    marginBottom: 15,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  button: {
    marginTop: 20,
  },
});

export default PatientForm;