import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MonthNavigator } from '@/components/ui/period-navigator';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Palette, Spacing } from '@/constants/theme';
import { useFetch } from '@/hooks/use-fetch';
import { query } from '@/lib/api';
import { formatHours, startOfMonth, toIsoMonth } from '@/lib/dates';
import type { MonthlyHoursReport } from '@/types/api';

export default function MonthlyReportScreen() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const isoMonth = toIsoMonth(month);
  const { data, error, isLoading, isRefreshing, refresh } = useFetch<MonthlyHoursReport>(
    `/reports/monthly-hours${query({ month: isoMonth })}`,
  );

  return (
    <FlatList
      style={styles.screen}
      data={isLoading || error ? [] : (data?.guards ?? [])}
      keyExtractor={(item) => String(item.guardId)}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <MonthNavigator value={month} onChange={setMonth} />
          {data && !isLoading && !error && (
            <Card style={styles.summary}>
              <Text style={styles.summaryValue}>{formatHours(data.totalHours)}</Text>
              <Text style={styles.summaryLabel}>
                {data.shiftCount} turnos entre {data.guards.length} guardias
              </Text>
            </Card>
          )}
        </View>
      }
      ListEmptyComponent={
        isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : (
          <EmptyState message="No hay guardias para mostrar." />
        )
      }
      renderItem={({ item }) => (
        <Card
          onPress={() =>
            router.push({ pathname: '/guards/[id]', params: { id: String(item.guardId), month: isoMonth } })
          }>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.name}>
                {item.lastName}, {item.firstName}
              </Text>
              <Text style={styles.detail}>
                DNI {item.dni} · {item.shiftCount} {item.shiftCount === 1 ? 'turno' : 'turnos'}
              </Text>
              {!item.active && <Badge label="Inactivo" tone="danger" />}
            </View>
            <Text style={styles.hours}>{formatHours(item.totalHours)}</Text>
          </View>
        </Card>
      )}
    />
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
    flexGrow: 1,
  },
  header: {
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  summary: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 34,
    fontWeight: '700',
    color: Palette.primary,
  },
  summaryLabel: {
    fontSize: 15,
    color: Palette.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
  },
  detail: {
    fontSize: 14,
    color: Palette.textMuted,
  },
  hours: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.primary,
  },
});
