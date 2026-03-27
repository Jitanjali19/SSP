import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Button } from 'react-native-paper';

const VendorDashboard: React.FC = () => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Vendor Dashboard</Title>
          <Button mode="contained" style={styles.button}>
            Create Camp
          </Button>
          <Button mode="outlined" style={styles.button}>
            View Camp Reports
          </Button>
          <Button mode="outlined" style={styles.button}>
            Create Sub-logins
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

export default VendorDashboard;