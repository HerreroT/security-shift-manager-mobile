import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Switch, Text, View } from 'react-native';

import { ActiveBadge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Fab } from '@/components/ui/fab';
import { SearchBar } from '@/components/ui/search-bar';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Palette, Spacing } from '@/constants/theme';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useFetch } from '@/hooks/use-fetch';
import { query } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Service } from '@/types/api';

export default function ServicesScreen() {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const debouncedSearch = useDebouncedValue(search.trim());
  const { data, error, isLoading, isRefreshing, refresh } = useFetch<Service[]>(
    `/services${query({ search: debouncedSearch, active: showInactive ? undefined : true })}`,
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por nombre o ubicación" />
            <View style={styles.toggle}>
              <Text style={styles.toggleLabel}>Mostrar inactivos</Text>
              <Switch value={showInactive} onValueChange={setShowInactive} />
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={refresh} />
          ) : (
            <EmptyState message={search ? 'No hay servicios que coincidan.' : 'Todavía no hay servicios.'} />
          )
        }
        renderItem={({ item }) => (
          <Card onPress={() => router.push({ pathname: '/services/[id]', params: { id: String(item.id) } })}>
            <View style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <ActiveBadge active={item.active} />
            </View>
            <Text style={styles.detail}>{item.location}</Text>
          </Card>
        )}
      />
      {isAdmin && <Fab label="Servicio" onPress={() => router.push('/services/form')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  list: {
    padding: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: 96,
    flexGrow: 1,
  },
  header: {
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  toggleLabel: {
    color: Palette.textMuted,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
  },
  detail: {
    fontSize: 14,
    color: Palette.textMuted,
  },
});
