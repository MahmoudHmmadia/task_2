import express from "express";
import { Server } from "socket.io";
import http from "http";
import { PeerServer } from "peer";
const peerServer = PeerServer({
  path: "/",
  port: 3001,
});
const app = express();
app.set("view engine", "ejs");
const server = http.Server(app);
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
app.use("/peerjs", (req, res, next) => {
  peerServer.listen(() => {
    console.log("from peer");
    next();
  });
});
server.listen(3000);
