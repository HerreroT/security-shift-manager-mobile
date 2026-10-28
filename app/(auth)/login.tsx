import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CustomButton } from '@/components/ui/custom-button';
import { InputField } from '@/components/ui/input-field';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { ApiError, errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { API_URL } from '@/lib/config';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginPress = async () => {
    if (!email.trim() || !password) {
      setError('Ingresá tu email y contraseña.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      // On success the protected routes take the user to the tabs.
      await signIn(email.trim(), password);
    } catch (e) {
      setError(e instanceof ApiError && e.status === 401 ? 'Email o contraseña incorrectos.' : errorMessage(e));
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <MaterialIcons name="shield" size={48} color={Palette.primary} />
        </View>
        <Text style={styles.title}>Security Shift Manager</Text>
        <Text style={styles.subtitle}>Gestión de guardias y servicios</Text>

        <View style={styles.form}>
          <InputField
            label="Email"
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <InputField
            label="Contraseña"
            placeholder="Contraseña"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleLoginPress}
            returnKeyType="go"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <CustomButton title="Ingresar" onPress={handleLoginPress} loading={isSubmitting} />
        </View>

        {__DEV__ && (
          <View style={styles.devHint}>
            <Text style={styles.devHintText}>Usuario de prueba: admin@shiftmanager.com / admin123</Text>
            <Text style={styles.devHintText}>Supervisor: supervisor@shiftmanager.com / supervisor123</Text>
            <Text style={styles.devHintText}>Servidor: {API_URL}</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Palette.card,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 48,
  },
  logo: {
    alignSelf: 'center',
    backgroundColor: Palette.primarySoft,
    borderRadius: Radius.pill,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: Palette.text,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: Palette.textMuted,
    marginTop: Spacing.xs,
    marginBottom: 32,
  },
  form: {
    gap: 14,
  },
  error: {
    color: Palette.danger,
    fontSize: 14,
  },
  devHint: {
    marginTop: 32,
    padding: Spacing.md,
    borderRadius: Radius.sm,
    backgroundColor: Palette.background,
    gap: Spacing.xs,
  },
  devHintText: {
    fontSize: 12,
    color: Palette.textMuted,
    textAlign: 'center',
  },
});
