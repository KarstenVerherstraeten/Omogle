import { useEffect, useState } from "react";

export const useWebRTC = (socketUrl) => {
  const [peerConnection, setPeerConnection] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isInitiator, setIsInitiator] = useState(false);
  const [messages, setMessages] = useState([]);  // <--- Add this to handle chat messages

  useEffect(() => {
    console.log("Initializing WebSocket connection to:", socketUrl);
    const newSocket = new WebSocket(socketUrl);
    setSocket(newSocket);

    const config = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };

    const newPeerConnection = new RTCPeerConnection(config);
    setPeerConnection(newPeerConnection);
    console.log("Created new RTCPeerConnection");

    newPeerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate:", event.candidate);
        newSocket.send(
          JSON.stringify({ type: "ice-candidate", candidate: event.candidate })
        );
      }
    };

    newPeerConnection.ontrack = (event) => {
      console.log("Remote stream received:", event.streams[0]);
      setRemoteStream(event.streams[0]);
    };

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        console.log("Local stream acquired:", stream);
        setLocalStream(stream);
        stream.getTracks().forEach((track) => {
          if (newPeerConnection.signalingState !== "closed") {
            console.log("Adding track to RTCPeerConnection:", track);
            newPeerConnection.addTrack(track, stream);
          }
        });
      })
      .catch((error) => console.error("Error getting user media", error));

    // WebSocket handling
    newSocket.onmessage = (message) => {
      const data = JSON.parse(message.data);
      console.log("WebSocket message received:", data);

      if (data.type === "offer") {
        console.log("Handling offer");
        handleOffer(data.offer);
      }
      if (data.type === "answer") {
        console.log("Handling answer");
        handleAnswer(data.answer);
      }
      if (data.type === "ice-candidate") {
        console.log("Handling ICE candidate");
        handleNewICECandidate(data.candidate);
      }
      if (data.type === "chat") {  // <--- Handling chat messages
        console.log("Received chat message:", data.message);
        handleChatMessage(data.message, "Other");
      }
    };

    const handleOffer = async (offer) => {
      try {
        console.log("Setting remote description with offer:", offer);
        if (newPeerConnection.signalingState === "closed") return;
        await newPeerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await newPeerConnection.createAnswer();
        console.log("Creating and sending answer:", answer);
        await newPeerConnection.setLocalDescription(answer);
        newSocket.send(JSON.stringify({ type: "answer", answer }));
      } catch (error) {
        console.error("Error handling offer", error);
      }
    };

    const handleAnswer = async (answer) => {
      try {
        console.log("Setting remote description with answer:", answer);
        if (newPeerConnection.signalingState === "closed") return;
        await newPeerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error("Error handling answer", error);
      }
    };

    const handleNewICECandidate = async (candidate) => {
      try {
        console.log("Adding received ICE candidate:", candidate);
        if (newPeerConnection.signalingState !== "closed") {
          await newPeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error("Error adding received ICE candidate", error);
      }
    };

    const createOffer = async () => {
      try {
        if (newPeerConnection.signalingState !== "closed") {
          console.log("Creating offer");
          const offer = await newPeerConnection.createOffer();
          await newPeerConnection.setLocalDescription(offer);
          console.log("Sending offer:", offer);
          newSocket.send(JSON.stringify({ type: "offer", offer }));
        }
      } catch (error) {
        console.error("Error creating offer", error);
      }
    };

    newSocket.onopen = () => {
      console.log("WebSocket connection opened");
      newSocket.send(JSON.stringify({ type: "join" }));
    };

    // Handle WebSocket message to determine initiator
    newSocket.onmessage = (message) => {
      const data = JSON.parse(message.data);
      console.log("WebSocket message received (initiator check):", data);

      if (data.type === "initiator") {
        console.log("This user is the initiator");
        setIsInitiator(true);
      }
    };

    if (isInitiator && peerConnection) {
      console.log("User is initiator, creating offer...");
      createOffer();
    }

    return () => {
      console.log("Cleaning up WebSocket and PeerConnection...");
      newSocket.close();
      if (newPeerConnection) newPeerConnection.close();
    };
  }, [socketUrl, isInitiator]);

  // Chat message handlers

  const handleChatMessage = (message, sender) => {
    setMessages((prevMessages) => [...prevMessages, { sender, text: message }]);
  };

  const sendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "chat", message }));
      handleChatMessage(message, "You");
    } else {
      console.error("WebSocket is not open. Cannot send message.");
    }
  };

  return { localStream, remoteStream, sendMessage, messages };
};