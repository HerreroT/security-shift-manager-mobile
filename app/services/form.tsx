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
import type { Service, ServiceRequest } from '@/types/api';

const EMPTY: ServiceRequest = { name: '', location: '', description: '', active: true };

/** Create a service, or edit it when an id is received. */
export default function ServiceFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const service = useFetch<Service>(id ? `/services/${id}` : null);

  if (id && service.isLoading) {
    return <LoadingState />;
  }
  if (id && (service.error || !service.data)) {
    return <ErrorState message={service.error ?? 'No se encontró el servicio.'} onRetry={service.refresh} />;
  }

  return <ServiceForm id={id ? Number(id) : null} initial={service.data ?? EMPTY} />;
}

type FormProps = {
  id: number | null;
  initial: ServiceRequest;
};

function ServiceForm({ id, initial }: FormProps) {
  const [form, setForm] = useState<ServiceRequest>({
    name: initial.name,
    location: initial.location,
    description: initial.description ?? '',
    active: initial.active,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const update = (field: keyof ServiceRequest) => (value: string | boolean) =>
    setForm((current) => ({ ...current, [field]: value }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Ingresá el nombre del servicio.';
    if (!form.location.trim()) next.location = 'Ingresá la ubicación.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setGeneralError(null);
    setIsSaving(true);
    const body = { ...form, description: form.description?.trim() || null };
    try {
      if (id) {
        await api.put(`/services/${id}`, body);
      } else {
        await api.post('/services', body);
      }
      router.back();
    } catch (e) {
      if (e instanceof ApiError && e.fields) {
        setErrors(e.fields);
      }
      setGeneralError(errorMessage(e));
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Stack.Screen options={{ title: id ? 'Editar servicio' : 'Nuevo servicio' }} />
      <InputField
        label="Nombre"
        value={form.name}
        onChangeText={update('name')}
        error={errors.name}
        placeholder="Ej: Barrio Belgrano"
      />
      <InputField
        label="Ubicación"
        value={form.location}
        onChangeText={update('location')}
        error={errors.location}
        placeholder="Dirección"
      />
      <InputField
        label="Descripción (opcional)"
        value={form.description ?? ''}
        onChangeText={update('description')}
        error={errors.description}
        multiline
        numberOfLines={3}
        style={styles.multiline}
        placeholder="Horarios de cobertura, accesos, contacto..."
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
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
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
