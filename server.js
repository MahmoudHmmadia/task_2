import express from "express";
import { Server } from "socket.io";
import http from "http";
import { ExpressPeerServer } from "peer";
import cors from "cors";
// const peerServer = PeerServer({
//   path: "/",
//   port: 3001,
// });
// const express = require("express");
// const { Server } = require("socket.io");
// const { ExpressPeerServer } = require("peer");
// const http = require("http");
// const cors = require("cors");
const app = express();
app.use(cors({ origin: true, credentials: true, optionsSuccessStatus: 200 }));
app.set("view engine", "ejs");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
  },
});
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.render("room");
});

io.on("connection", (socket) => {
  socket.on("join-room", (rId, uId) => {
    socket.join(rId);
    socket.to(rId).emit("user-connected", uId);
    socket.on("disconnect", () => {
      socket.to(rId).emit("user-disconnected", uId);
    });
  });
});

const expressPeerServer = ExpressPeerServer(server, {
  debug: true,
  path: "/",
  corsOptions: {
    origin: true,
  },
});
app.use(expressPeerServer);

server.listen(process.env.PORT || 3002, () => {
  console.log("asd");
});
