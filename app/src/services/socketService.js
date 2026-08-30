import { io } from "socket.io-client";
import { Platform } from "react-native";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  getSocketUrl() {
    if (process.env.EXPO_PUBLIC_SOCKET_URL) {
      return process.env.EXPO_PUBLIC_SOCKET_URL;
    }
    if (Platform.OS === "android") {
      return "http://10.0.2.2:5000";
    }
    return "http://localhost:5000";
  }

  connect() {
    if (this.socket && this.isConnected) return this.socket;

    const serverUrl = this.getSocketUrl();
    console.log(`[SocketService] Connecting to ${serverUrl}...`);

    this.socket = io(serverUrl, {
      transports: ["websocket"],
      query: { client: "mobile_android" },
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    this.socket.on("connect", () => {
      this.isConnected = true;
      console.log(`[SocketService] 🟢 Connected: ${this.socket.id}`);
    });

    this.socket.on("disconnect", (reason) => {
      this.isConnected = false;
      console.log(`[SocketService] 🔴 Disconnected: ${reason}`);
    });

    this.socket.on("connect_error", (err) => {
      console.warn(`[SocketService] Connection error: ${err.message}`);
    });

    return this.socket;
  }

  // Subscribe to specific real-time event (e.g. connect:new_post)
  on(event, callback) {
    if (!this.socket) {
      this.connect();
    }
    this.socket.on(event, callback);
  }

  // Unsubscribe from real-time event
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export const socketService = new SocketService();
