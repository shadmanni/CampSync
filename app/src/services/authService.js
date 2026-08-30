import * as SecureStore from "expo-secure-store";
import api from "./api";

const TOKEN_KEY = "campussync_jwt";
const USER_KEY = "campussync_user";

export const authService = {
  // 1. Request 6-digit OTP code to college email
  async requestOtp(email) {
    return await api.post("/auth/request-otp", { email });
  },

  // 2. Verify OTP code and receive JWT + user object
  async verifyOtp(email, otp) {
    const data = await api.post("/auth/verify-otp", { email, otp });
    if (data.token) {
      await this.saveToken(data.token);
    }
    if (data.user) {
      await this.saveUser(data.user);
    }
    return data;
  },

  // 3. Fetch authenticated user profile
  async getMe() {
    return await api.get("/auth/me");
  },

  // 4. Secure Storage Helpers (using expo-secure-store exclusively)
  async saveToken(token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async getToken() {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  async removeToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async saveUser(user) {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },

  async getUser() {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  async clearSession() {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY)
    ]);
  }
};
