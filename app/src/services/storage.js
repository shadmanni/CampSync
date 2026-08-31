import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Universal Storage Adapter:
 * Uses expo-secure-store (hardware-backed Android Keystore / iOS Keychain) on native mobile devices,
 * and localStorage when running in web browser preview environments.
 */
export const storage = {
  async setItem(key, value) {
    if (Platform.OS === "web") {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch (e) {
        console.warn("[Storage] setItem web error:", e);
      }
      return;
    }
    return await SecureStore.setItemAsync(key, value);
  },

  async getItem(key) {
    if (Platform.OS === "web") {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch (e) {
        console.warn("[Storage] getItem web error:", e);
      }
      return null;
    }
    return await SecureStore.getItemAsync(key);
  },

  async deleteItem(key) {
    if (Platform.OS === "web") {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } catch (e) {
        console.warn("[Storage] deleteItem web error:", e);
      }
      return;
    }
    return await SecureStore.deleteItemAsync(key);
  }
};
