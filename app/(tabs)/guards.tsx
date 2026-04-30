import { StyleSheet, Text, View } from 'react-native';

export default function GuardsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Guards</Text>
      <Text style={styles.description}>This screen will show your guards list.</Text>
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
