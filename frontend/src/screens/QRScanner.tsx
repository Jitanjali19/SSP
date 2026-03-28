import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, Card, Paragraph } from 'react-native-paper';
import { patientAPI } from '../services/api';
import { Patient } from '../types';

const QRScanner = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarcodeScanned = useCallback(
    async (event: { data?: string; nativeEvent?: { codeStringValue?: string } }) => {
      if (scanned) return;

      const qrData = event?.nativeEvent?.codeStringValue || event?.data;
      if (!qrData) {
        Alert.alert('Scan error', 'No QR data detected.');
        return;
      }

      setScanned(true);
      setIsLoading(true);
      setError(null);

      try {
        const patientData = await patientAPI.getByQR(qrData);
        setPatient(patientData);
      } catch (err: any) {
        console.error('QR lookup failed', err);
        const msg = err?.response?.data?.message || 'Patient not found for scanned QR code.';
        setError(msg);
        Alert.alert('QR Lookup Failed', msg);
        setPatient(null);
      } finally {
        setIsLoading(false);
      }
    },
    [scanned],
  );

  if (!permission) {
    return <Text style={styles.status}>Requesting camera permission...</Text>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.status}>Camera permission is required to scan QR codes.</Text>
        <Button mode="contained" onPress={requestPermission} style={styles.button}>
          Grant Permission
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        cameraType="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleBarcodeScanned}
      />

      {isLoading && <Text style={styles.status}>Fetching patient details...</Text>}

      {error && <Text style={styles.error}>{error}</Text>}

      {patient && (
        <Card style={styles.card}>
          <Card.Title title={`${patient.firstName} ${patient.lastName}`} subtitle={`ID: ${patient.id}`} />
          <Card.Content>
            <Paragraph>Age: {patient.age ?? 'N/A'}</Paragraph>
            <Paragraph>Gender: {patient.gender ?? 'N/A'}</Paragraph>
            <Paragraph>Mobile: {patient.mobile ?? 'N/A'}</Paragraph>
            <Paragraph>Address: {patient.address ?? 'N/A'}</Paragraph>
          </Card.Content>
        </Card>
      )}

      <Button
        mode="contained"
        disabled={!scanned}
        onPress={() => {
          setScanned(false);
          setError(null);
          setPatient(null);
        }}
        style={styles.button}
      >
        Scan Again
      </Button>
    </View>
  );
};

export default QRScanner;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  status: { color: 'white', textAlign: 'center', margin: 12 },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  button: { margin: 12 },
  error: { color: 'red', textAlign: 'center', margin: 10 },
  card: { margin: 12 },
});