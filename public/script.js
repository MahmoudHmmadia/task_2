const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;
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
          host: "/",
          port: 3000,
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
