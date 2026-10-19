import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Label } from '@/components/ui/label';
import { Palette, Radius, Spacing } from '@/constants/theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export function InputField({ label, error, style, ...inputProps }: Props) {
  return (
    <View style={styles.container}>
      <Label>{label}</Label>
      <TextInput
        placeholderTextColor={Palette.textMuted}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: Palette.card,
    color: Palette.text,
  },
  inputError: {
    borderColor: Palette.danger,
  },
  error: {
    color: Palette.danger,
    fontSize: 13,
  },
});
