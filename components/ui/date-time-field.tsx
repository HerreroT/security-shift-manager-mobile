import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Label } from '@/components/ui/label';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { formatShortDate, formatTime, toIsoDate } from '@/lib/dates';

type Props = {
  value: Date;
  onChange: (value: Date) => void;
  mode: 'date' | 'time';
  label?: string;
};

/**
 * Date or time picker that works in Expo Go: native dialog on Android, compact picker on iOS and a
 * text input on web. When picking a time the date part of the value is kept, and vice versa.
 */
export function DateTimeField({ value, onChange, mode, label }: Props) {
  return (
    <View style={styles.container}>
      {label ? <Label>{label}</Label> : null}
      {Platform.OS === 'ios' ? (
        <DateTimePicker
          value={value}
          mode={mode}
          display="compact"
          locale="es-AR"
          onChange={(_, date) => date && onChange(date)}
          style={styles.iosPicker}
        />
      ) : Platform.OS === 'android' ? (
        <AndroidField value={value} onChange={onChange} mode={mode} />
      ) : (
        <WebField value={value} onChange={onChange} mode={mode} />
      )}
    </View>
  );
}

function AndroidField({ value, onChange, mode }: Props) {
  const open = () =>
    DateTimePickerAndroid.open({
      value,
      mode,
      is24Hour: true,
      onChange: (event, date) => {
        if (event.type === 'set' && date) {
          onChange(date);
        }
      },
    });

  return (
    <Pressable onPress={open} style={({ pressed }) => [styles.field, pressed && styles.pressed]}>
      <MaterialIcons name={mode === 'date' ? 'event' : 'schedule'} size={20} color={Palette.primary} />
      <Text style={styles.value}>{mode === 'date' ? formatShortDate(value) : formatTime(value)}</Text>
    </Pressable>
  );
}

function WebField({ value, onChange, mode }: Props) {
  const format = (date: Date) => (mode === 'date' ? toIsoDate(date) : formatTime(date));
  const [text, setText] = useState(format(value));

  const apply = () => {
    const next = new Date(value);
    if (mode === 'date') {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
      if (match) next.setFullYear(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    } else {
      const match = /^(\d{1,2}):(\d{2})$/.exec(text);
      if (match) next.setHours(Number(match[1]), Number(match[2]));
    }
    if (!Number.isNaN(next.getTime())) {
      onChange(next);
      setText(format(next));
    }
  };

  return (
    <TextInput
      style={[styles.field, styles.value]}
      value={text}
      onChangeText={setText}
      onBlur={apply}
      onSubmitEditing={apply}
      placeholder={mode === 'date' ? 'AAAA-MM-DD' : 'HH:MM'}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Palette.card,
  },
  pressed: {
    opacity: 0.7,
  },
  value: {
    fontSize: 16,
    color: Palette.text,
  },
  iosPicker: {
    alignSelf: 'flex-start',
  },
});
