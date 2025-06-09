const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidV4 } = require("uuid");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
io.on("connection",(socket)=>{
    console.log(`user connected ${socket.id}`)
    socket.on("createRoom",(callback)=>{
        setRoomid(id)
        setJoined(true)
        setPlayer("X")
    })
})
server.listen(5000,()=>{
    console.log("Server is runing")
})
