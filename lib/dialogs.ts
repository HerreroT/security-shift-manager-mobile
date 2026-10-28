import { Alert, Platform } from 'react-native';

// Alert.alert does nothing on web (react-native-web leaves it empty), so the browser dialogs are used there.

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
};

/** Asks before running onConfirm, with "Cancelar" and confirmLabel as the options. */
export function confirmAction({ title, message, confirmLabel, destructive = false, onConfirm }: ConfirmOptions) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}

export function showError(message: string) {
  if (Platform.OS === 'web') {
    globalThis.alert(message);
    return;
  }
  Alert.alert('Error', message);
}
