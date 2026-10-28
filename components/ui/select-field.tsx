import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Label } from '@/components/ui/label';
import { SearchBar } from '@/components/ui/search-bar';
import { EmptyState } from '@/components/ui/states';
import { Palette, Radius, Spacing } from '@/constants/theme';

type Props<T extends { id: number }> = {
  label: string;
  placeholder: string;
  options: T[];
  selectedId: number | null;
  onSelect: (option: T | null) => void;
  getLabel: (option: T) => string;
  getSubtitle?: (option: T) => string;
  /** Shows an extra option to clear the selection, e.g. "Todos los servicios". */
  clearLabel?: string;
  error?: string;
};

/** A field that opens a searchable list in a modal. */
export function SelectField<T extends { id: number }>({
  label,
  placeholder,
  options,
  selectedId,
  onSelect,
  getLabel,
  getSubtitle,
  clearLabel,
  error,
}: Props<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = options.find((option) => option.id === selectedId) ?? null;
  const normalizedSearch = search.trim().toLowerCase();
  const filtered = normalizedSearch
    ? options.filter((option) =>
        `${getLabel(option)} ${getSubtitle?.(option) ?? ''}`.toLowerCase().includes(normalizedSearch),
      )
    : options;

  const choose = (option: T | null) => {
    onSelect(option);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <View style={styles.container}>
      <Label>{label}</Label>
      <Pressable
        onPress={() => setIsOpen(true)}
        style={({ pressed }) => [styles.field, error ? styles.fieldError : null, pressed && styles.pressed]}>
        <Text style={[styles.value, !selected && styles.placeholder]} numberOfLines={1}>
          {selected ? getLabel(selected) : clearLabel ?? placeholder}
        </Text>
        <MaterialIcons name="expand-more" size={22} color={Palette.textMuted} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={isOpen} animationType="slide" onRequestClose={() => setIsOpen(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{label}</Text>
            <Pressable onPress={() => setIsOpen(false)} hitSlop={12} accessibilityLabel="Cerrar">
              <MaterialIcons name="close" size={26} color={Palette.text} />
            </Pressable>
          </View>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar..." />
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              clearLabel ? (
                <Option label={clearLabel} selected={selectedId === null} onPress={() => choose(null)} />
              ) : undefined
            }
            ListEmptyComponent={<EmptyState message="No hay resultados" icon="search-off" />}
            renderItem={({ item }) => (
              <Option
                label={getLabel(item)}
                subtitle={getSubtitle?.(item)}
                selected={item.id === selectedId}
                onPress={() => choose(item)}
              />
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

type OptionProps = {
  label: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
};

function Option({ label, subtitle, selected, onPress }: OptionProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
      <View style={styles.optionText}>
        <Text style={styles.optionLabel}>{label}</Text>
        {subtitle ? <Text style={styles.optionSubtitle}>{subtitle}</Text> : null}
      </View>
      {selected && <MaterialIcons name="check" size={22} color={Palette.primary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Palette.card,
  },
  fieldError: {
    borderColor: Palette.danger,
  },
  pressed: {
    opacity: 0.7,
  },
  value: {
    flex: 1,
    fontSize: 16,
    color: Palette.text,
  },
  placeholder: {
    color: Palette.textMuted,
  },
  error: {
    color: Palette.danger,
    fontSize: 13,
  },
  modal: {
    flex: 1,
    backgroundColor: Palette.background,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.text,
  },
  list: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: Spacing.lg,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: 16,
    color: Palette.text,
    fontWeight: '500',
  },
  optionSubtitle: {
    fontSize: 13,
    color: Palette.textMuted,
  },
});
