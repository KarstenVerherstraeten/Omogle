import { useEffect, useState, useRef } from "react";

export const useWebRTC = (socketUrl) => {
  const [peerConnection, setPeerConnection] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isInitiator, setIsInitiator] = useState(false);
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState(null); // Room ID to associate users
  const [userId, setUserId] = useState(null); // User ID for this client
  const socketRef = useRef(null); // To avoid creating new socket each render

  useEffect(() => {
    console.log("Initializing WebSocket connection to:", socketUrl);
    const newSocket = new WebSocket(socketUrl);
    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.onopen = () => {
      console.log("WebSocket connection opened");
      newSocket.send(JSON.stringify({ type: "join", roomId }));
    };

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

    // Get user media (video and audio)
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

      if (data.type === "chat") {
        console.log("Received chat message:", data.message);
        handleChatMessage(data.message, "Other");
      }

      if (data.type === "user-id") {
        console.log("Received user ID:", data.userId);
        setUserId(data.userId); // Set the user ID when connected
      }

      if (data.type === "room-id") {
        console.log("Received room ID:", data.roomId);
        setRoomId(data.roomId); // Set the room ID
      }
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
  }, [socketUrl, isInitiator, roomId]);

  // WebRTC signaling functions
  const handleOffer = async (offer) => {
    try {
      console.log("Setting remote description with offer:", offer);
      if (peerConnection.signalingState === "closed") return;
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      console.log("Creating and sending answer:", answer);
      await peerConnection.setLocalDescription(answer);
      socket.send(JSON.stringify({ type: "answer", answer }));
    } catch (error) {
      console.error("Error handling offer", error);
    }
  };

  const handleAnswer = async (answer) => {
    try {
      console.log("Setting remote description with answer:", answer);
      if (peerConnection.signalingState === "closed") return;
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error("Error handling answer", error);
    }
  };

  const handleNewICECandidate = async (candidate) => {
    try {
      console.log("Adding received ICE candidate:", candidate);
      if (peerConnection.signalingState !== "closed") {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error("Error adding received ICE candidate", error);
    }
  };

  const createOffer = async () => {
    try {
      if (peerConnection.signalingState !== "closed") {
        console.log("Creating offer");
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        console.log("Sending offer:", offer);
        socket.send(JSON.stringify({ type: "offer", offer }));
      }
    } catch (error) {
      console.error("Error creating offer", error);
    }
  };

  // Chat functionality
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

  return { localStream, remoteStream, sendMessage, messages, roomId, userId };
};