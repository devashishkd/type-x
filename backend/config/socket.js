// config/socket.js
// this file ONLY creates the socket.io instance
// all the event handling logic lives in socket/index.js

import { Server } from "socket.io";

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin) || origin.endsWith('.onrender.com') || origin.endsWith('.vercel.app')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}