// socket/index.js
// registers the auth middleware and all socket event handlers
// keeps this file clean — each concern has its own file

import { getIO } from "../config/socket.js";
import socketAuthMiddleware from "./authMiddleware.js";
import { registerRoomHandlers } from "./handlers/roomHandlers.js";
import { registerChatHandlers } from "./handlers/chatHandlers.js";
import { registerGameHandlers } from "./handlers/gameHandlers.js";
import { registerMatchmakingHandlers } from "./handlers/matchmakingHandlers.js";

export function registerSocketHandlers() {
  const io = getIO();

  // check JWT before allowing any connection
  io.use(socketAuthMiddleware);

  // runs for every client that passes auth
  io.on("connection", (socket) => {
    console.log(`⚡ ${socket.user.username} connected (${socket.id})`);
    
    // Broadcast updated user count
    io.emit("active_users", io.engine.clientsCount);

    socket.on("request_active_users", () => {
      socket.emit("active_users", io.engine.clientsCount);
    });

    // register all the event handlers for this socket
    registerRoomHandlers(io, socket);

    registerChatHandlers(io, socket);

    registerGameHandlers(io, socket);

    registerMatchmakingHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log(`💤 ${socket.user.username} disconnected (${socket.id})`);
      // Broadcast updated user count
      io.emit("active_users", io.engine.clientsCount);
    });
  });
}
