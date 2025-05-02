// utils/navigationStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import {validateNavigationState} from './validateNavigationState';

const NAVIGATION_STATE_KEY = '@navigation_state';
const MAX_STORED_STATES = 64;

export const navigationStorage = {
  async cleanupOldStates() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const navigationKeys = keys.filter(key =>
        key.startsWith(NAVIGATION_STATE_KEY),
      );
      if (navigationKeys.length > MAX_STORED_STATES) {
        const keysToRemove = navigationKeys.slice(0, -MAX_STORED_STATES);
        await AsyncStorage.multiRemove(keysToRemove);
      }
    } catch (err) {
      console.warn('Navigation state cleanup failed:', err);
    }
  },

  async saveState(state: any) {
    try {
      await AsyncStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify(state));
      await this.cleanupOldStates();
    } catch (err) {
      console.warn('Failed to save navigation state:', err);
    }
  },

  async loadState() {
    try {
      const savedStateString = await AsyncStorage.getItem(NAVIGATION_STATE_KEY);
      if (!savedStateString) return null;

      const state = JSON.parse(savedStateString);
      return validateNavigationState(state) ? state : null;
    } catch (err) {
      console.warn('Failed to load navigation state:', err);
      return null;
    }
  },
};
