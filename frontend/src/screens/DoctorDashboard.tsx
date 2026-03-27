import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, TextInput } from 'react-native-paper';
import { Patient } from '../types';

const DoctorDashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]); // Fetch from API
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [remarks, setRemarks] = useState('');

  const handleSubmitDiagnosis = () => {
    // Submit to API
    Alert.alert('Success', 'Diagnosis submitted');
  };

  const renderPatient = ({ item }: { item: Patient }) => (
    <Card style={styles.patientCard} onPress={() => setSelectedPatient(item)}>
      <Card.Content>
        <Title>{item.fullName}</Title>
        <Paragraph>Phone: {item.phone}</Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {!selectedPatient ? (
        <FlatList
          data={patients}
          renderItem={renderPatient}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={<Title>Patient List</Title>}
        />
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Title>{selectedPatient.fullName}</Title>
            <TextInput
              label="Diagnosis"
              value={diagnosis}
              onChangeText={setDiagnosis}
              mode="outlined"
              multiline
              style={styles.input}
            />
            <TextInput
              label="Prescription"
              value={prescription}
              onChangeText={setPrescription}
              mode="outlined"
              multiline
              style={styles.input}
            />
            <TextInput
              label="Remarks"
              value={remarks}
              onChangeText={setRemarks}
              mode="outlined"
              multiline
              style={styles.input}
            />
            <Button mode="contained" onPress={handleSubmitDiagnosis} style={styles.button}>
              Submit
            </Button>
            <Button onPress={() => setSelectedPatient(null)} style={styles.button}>
              Back
            </Button>
          </Card.Content>
        </Card>
      )}
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
  },
  patientCard: {
    marginVertical: 5,
    elevation: 2,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginVertical: 5,
  },
});

export default DoctorDashboard;