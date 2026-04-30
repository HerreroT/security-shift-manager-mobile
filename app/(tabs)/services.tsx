import { StyleSheet, Text, View } from 'react-native';

export default function ServicesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Services</Text>
      <Text style={styles.description}>This screen will list available services.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  description: {
    marginTop: 12,
    fontSize: 16,
    color: '#4B5563',
  },
});
