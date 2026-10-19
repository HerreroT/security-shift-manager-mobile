import Constants from 'expo-constants';
import { Platform } from 'react-native';

const BACKEND_PORT = 8090;

/**
 * Resolves the backend URL.
 *
 * 1. EXPO_PUBLIC_API_URL from .env, if it is set.
 * 2. Otherwise the IP of the PC running Metro (the same one Expo Go uses to load the app),
 *    so a phone on the same WiFi or an emulator can reach the backend without configuration.
 * 3. Fallbacks: 10.0.2.2 for the Android emulator, localhost for web and iOS simulator.
 */
function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, '');
  }

  if (Platform.OS === 'web') {
    return `http://localhost:${BACKEND_PORT}/api`;
  }

  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host) {
    return `http://${host}:${BACKEND_PORT}/api`;
  }

  return Platform.OS === 'android'
    ? `http://10.0.2.2:${BACKEND_PORT}/api`
    : `http://localhost:${BACKEND_PORT}/api`;
}

export const API_URL = resolveApiUrl();
