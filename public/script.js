const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;
const iceConfiguration = {
  iceServers: [
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "976776674d5e26c0b97dd685",
      credentials: "dqwWyHCY+eCXcn8I",
    },
  ],
};

let Peer = window.Peer;
document.querySelector(".btn").addEventListener("click", () => {
  const room = document.querySelector(".room").value;
  if (room !== "") {
    if (document.querySelector(".error"))
      document.querySelector(".error").remove();
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        const myPeer = new Peer({
          host: "task-2-om2k.onrender.com",
          // host: "localhost",
          // port: 3002,
          debug: 3,
          secure: true,
          // iceConfiguration,
        });
        myPeer.on("open", (id) => {
          socket.emit("join-room", room, id);
        });
        const peers = {};
        addVideoStream(myVideo, stream);
        myPeer.on("call", (call) => {
          call.answer(stream);
          const video = document.createElement("video");
          call.on("stream", (userVideoStream) => {
            addVideoStream(video, userVideoStream);
          });
        });
        socket.on("user-connected", (userId) => {
          connectToNewUser(userId, stream);
        });
        socket.on("user-disconnected", (userId) => {
          if (peers[userId]) peers[userId].close();
        });
        function connectToNewUser(userId, stream) {
          const call = myPeer.call(userId, stream);
          const video = document.createElement("video");
          call.on("stream", (userVideoStream) => {
            addVideoStream(video, userVideoStream);
          });
          call.on("close", () => {
            video.remove();
          });

          peers[userId] = call;
        }
        function addVideoStream(video, stream) {
          video.srcObject = stream;
          video.addEventListener("loadedmetadata", () => {
            video.play();
          });
          videoGrid.append(video);
        }
      });
  } else {
    document.querySelector(".error").append("Room Is Required");
  }
});
