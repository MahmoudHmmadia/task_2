const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;
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
          // port: 3002,
          debug: 3,
          secure: true,
          config: {
            iceServers: [
              { url: "stun:stun01.sipphone.com" },
              { url: "stun:stun.ekiga.net" },
              { url: "stun:stunserver.org" },
              { url: "stun:stun.softjoys.com" },
              { url: "stun:stun.voiparound.com" },
              { url: "stun:stun.voipbuster.com" },
              { url: "stun:stun.voipstunt.com" },
              { url: "stun:stun.voxgratia.org" },
              { url: "stun:stun.xten.com" },
              {
                url: "turn:192.158.29.39:3478?transport=udp",
                credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
                username: "28224511:1379330808",
              },
              {
                url: "turn:192.158.29.39:3478?transport=tcp",
                credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
                username: "28224511:1379330808",
              },
            ],
          },
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
