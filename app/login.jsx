import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

const Icon = ({ name }) => (
  <View style={styles.iconPlaceholder}>
    <Text>{name}</Text>
  </View>
);

export default function LoginChoice() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Link href="/signup" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/signin" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </Link>
      <View style={styles.iconRow}>
        <Icon name="IG" />
        <Icon name="LI" />
        <Icon name="FB" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 32, marginBottom: 40 },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, marginVertical: 10, width: 200, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18 },
  iconRow: { flexDirection: 'row', marginTop: 40 },
  iconPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginHorizontal: 10 }
});