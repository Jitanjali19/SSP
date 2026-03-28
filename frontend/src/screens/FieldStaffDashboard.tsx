import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const FieldStaffDashboard: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Field Staff Dashboard" />
        <Card.Content>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('QRScanner' as never)}
            style={styles.button}
          >
            Scan QR Code
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('PatientForm' as never)}
            style={styles.button}
          >
            Manual Entry
          </Button>
        </Card.Content>
      </Card>
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
  button: {
    marginVertical: 10,
  },
});

export default FieldStaffDashboard;