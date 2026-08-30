import { storage } from "./storage";
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

  // 4. Secure Storage Helpers
  async saveToken(token) {
    await storage.setItem(TOKEN_KEY, token);
  },

  async getToken() {
    return await storage.getItem(TOKEN_KEY);
  },

  async removeToken() {
    await storage.deleteItem(TOKEN_KEY);
  },

  async saveUser(user) {
    await storage.setItem(USER_KEY, JSON.stringify(user));
  },

  async getUser() {
    const raw = await storage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  async clearSession() {
    await Promise.all([
      storage.deleteItem(TOKEN_KEY),
      storage.deleteItem(USER_KEY)
    ]);
  }
};
