let state = "prod";
const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;
let Peer = window.Peer;
document.querySelector(".btn").addEventListener("click", () => {
  const room = document.querySelector(".room").value.toLowerCase();
  if (room !== "") {
    if (document.querySelector(".error"))
      document.querySelector(".error").remove();
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: {
          noiseSuppression: true,
          echoCancellation: true, // Optional: Enable echo cancellation
        },
      })
      .then((stream) => {
        let myPeer;
        if (state === "dev") {
          myPeer = new Peer({
            host: "localhost",
            port: 3002,
            debug: 3,
            secure: false,
            // config: {
            //   iceServers: [
            //     {
            //       urls: "stun:stun.relay.metered.ca:80",
            //     },
            //     {
            //       urls: "turn:a.relay.metered.ca:80",
            //       username: "976776674d5e26c0b97dd685",
            //       credential: "dqwWyHCY+eCXcn8I",
            //     },
            //     {
            //       urls: "turn:a.relay.metered.ca:80?transport=tcp",
            //       username: "976776674d5e26c0b97dd685",
            //       credential: "dqwWyHCY+eCXcn8I",
            //     },
            //     {
            //       urls: "turn:a.relay.metered.ca:443",
            //       username: "976776674d5e26c0b97dd685",
            //       credential: "dqwWyHCY+eCXcn8I",
            //     },
            //     {
            //       urls: "turn:a.relay.metered.ca:443?transport=tcp",
            //       username: "976776674d5e26c0b97dd685",
            //       credential: "dqwWyHCY+eCXcn8I",
            //     },
            //   ],
            // },
          });
        } else {
          myPeer = new Peer({
            host: "185.77.96.221",
            debug: 3,
            sercure:false,
            port: 5000,
            config: {
              iceServers: [
                {
                  urls: "stun:stun.relay.metered.ca:80",
                },
                {
                  urls: "turn:a.relay.metered.ca:80",
                  username: "976776674d5e26c0b97dd685",
                  credential: "dqwWyHCY+eCXcn8I",
                },
                {
                  urls: "turn:a.relay.metered.ca:80?transport=tcp",
                  username: "976776674d5e26c0b97dd685",
                  credential: "dqwWyHCY+eCXcn8I",
                },
                {
                  urls: "turn:a.relay.metered.ca:443",
                  username: "976776674d5e26c0b97dd685",
                  credential: "dqwWyHCY+eCXcn8I",
                },
                {
                  urls: "turn:a.relay.metered.ca:443?transport=tcp",
                  username: "976776674d5e26c0b97dd685",
                  credential: "dqwWyHCY+eCXcn8I",
                },
              ],
            },
          });
        }
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
