/**
 * Socket.io Real-Time Handler
 * Manages live Web & Mobile socket connections and broadcasts state changes.
 */

export function setupSocketHandlers(io) {
  io.on("connection", (socket) => {
    const clientType = socket.handshake.query.client || "web";
    console.log(`[Socket.io] 🟢 Client connected [${socket.id}] (Platform: ${clientType})`);

    // Join specific room channels (e.g. for a specific auction item or carpool)
    socket.on("join:room", (roomName) => {
      socket.join(roomName);
      console.log(`[Socket.io] Client ${socket.id} joined room: ${roomName}`);
    });

    socket.on("leave:room", (roomName) => {
      socket.leave(roomName);
      console.log(`[Socket.io] Client ${socket.id} left room: ${roomName}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket.io] 🔴 Client disconnected [${socket.id}] Reason: ${reason}`);
    });
  });

  return {
    broadcastBidUpdate: (payload) => {
      io.emit("bid:new_highest", payload);
    },
    broadcastSeatUpdate: (payload) => {
      io.emit("ride:seat_updated", payload);
    },
    broadcastNewPost: (post) => {
      io.emit("connect:new_post", post);
    },
    broadcastNewSkill: (skill) => {
      io.emit("skill:created", skill);
    },
    broadcastNewTask: (task) => {
      io.emit("task:created", task);
    },
    broadcastTaskAssigned: (payload) => {
      io.emit("task:assigned", payload);
    },
    broadcastTaskCompleted: (payload) => {
      io.emit("task:completed", payload);
    }
  };
}
