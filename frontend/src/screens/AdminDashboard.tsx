import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Button } from 'react-native-paper';

const AdminDashboard: React.FC = () => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Admin Dashboard</Title>
          <Button mode="contained" style={styles.button}>
            Approve Vendors
          </Button>
          <Button mode="outlined" style={styles.button}>
            Approve Patients
          </Button>
          <Button mode="outlined" style={styles.button}>
            View Registrations
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

export default AdminDashboard;