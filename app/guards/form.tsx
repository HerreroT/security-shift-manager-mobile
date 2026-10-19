import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { CustomButton } from '@/components/ui/custom-button';
import { InputField } from '@/components/ui/input-field';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { Palette, Spacing } from '@/constants/theme';
import { useFetch } from '@/hooks/use-fetch';
import { api, ApiError, errorMessage } from '@/lib/api';
import type { Guard, GuardRequest } from '@/types/api';

const EMPTY: GuardRequest = { firstName: '', lastName: '', dni: '', phone: '', active: true };

/** Create a guard, or edit it when an id is received. */
export default function GuardFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const guard = useFetch<Guard>(id ? `/guards/${id}` : null);

  if (id && guard.isLoading) {
    return <LoadingState />;
  }
  if (id && (guard.error || !guard.data)) {
    return <ErrorState message={guard.error ?? 'No se encontró el guardia.'} onRetry={guard.refresh} />;
  }

  return <GuardForm id={id ? Number(id) : null} initial={guard.data ?? EMPTY} />;
}

type FormProps = {
  id: number | null;
  initial: GuardRequest;
};

function GuardForm({ id, initial }: FormProps) {
  const [form, setForm] = useState<GuardRequest>({
    firstName: initial.firstName,
    lastName: initial.lastName,
    dni: initial.dni,
    phone: initial.phone,
    active: initial.active,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const update = (field: keyof GuardRequest) => (value: string | boolean) =>
    setForm((current) => ({ ...current, [field]: value }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.firstName = 'Ingresá el nombre.';
    if (!form.lastName.trim()) next.lastName = 'Ingresá el apellido.';
    if (!/^\d{7,8}$/.test(form.dni)) next.dni = 'El DNI debe tener 7 u 8 números, sin puntos.';
    if (!form.phone.trim()) next.phone = 'Ingresá el teléfono.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setGeneralError(null);
    setIsSaving(true);
    try {
      if (id) {
        await api.put(`/guards/${id}`, form);
      } else {
        await api.post('/guards', form);
      }
      router.back();
    } catch (e) {
      if (e instanceof ApiError && e.fields) {
        setErrors(e.fields);
      }
      setGeneralError(
        e instanceof ApiError && e.status === 409 ? 'Ya existe un guardia con ese DNI.' : errorMessage(e),
      );
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Stack.Screen options={{ title: id ? 'Editar guardia' : 'Nuevo guardia' }} />
      <InputField
        label="Nombre"
        value={form.firstName}
        onChangeText={update('firstName')}
        error={errors.firstName}
        autoCapitalize="words"
      />
      <InputField
        label="Apellido"
        value={form.lastName}
        onChangeText={update('lastName')}
        error={errors.lastName}
        autoCapitalize="words"
      />
      <InputField
        label="DNI"
        value={form.dni}
        onChangeText={(text) => update('dni')(text.replace(/\D/g, ''))}
        error={errors.dni}
        keyboardType="number-pad"
        maxLength={8}
        placeholder="Sin puntos"
      />
      <InputField
        label="Teléfono"
        value={form.phone}
        onChangeText={update('phone')}
        error={errors.phone}
        keyboardType="phone-pad"
      />
      {id && (
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Activo</Text>
          <Switch value={form.active} onValueChange={update('active')} />
        </View>
      )}
      {generalError ? <Text style={styles.error}>{generalError}</Text> : null}
      <CustomButton title="Guardar" icon="save" onPress={save} loading={isSaving} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  switchLabel: {
    fontSize: 16,
    color: Palette.text,
  },
  error: {
    color: Palette.danger,
    fontSize: 14,
  },
});
