import React, { useEffect, useRef, useState } from "react";
import { useWebRTC } from "../Components/useWebRTC";
import style from "../Modules/ChatRoom.module.css";

const VideoChat = ({ socketUrl }) => {
  const { localStream, remoteStream, sendMessage, messages } = useWebRTC(socketUrl);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      sendMessage(currentMessage);
      setCurrentMessage(""); // Clear the input after sending
    }
  };

  return (
    <>
      <div className={style.container}>
        <header className={style.header}>
          <h1 className={style.logo}>Omogle</h1>
        </header>

        <div className={style.videoSection}>
          <div className={style.videoContainer}>
            <h2 className={style.videoTitle}>Local Video</h2>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={style.localVideo}
            />
          </div>

          <div className={style.videoContainer}>
            <h2 className={style.videoTitle}>Remote Video</h2>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={style.remoteVideo}
            />
          </div>
        </div>

        <div className={style.chatSection}>
          <div className={style.messagesContainer}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.sender === "You" ? style.myMessage : style.otherMessage
                }
              >
                <strong>{message.sender}: </strong> {message.text}
              </div>
            ))}
          </div>

          <div className={style.messageInputContainer}>
            <input
              type="text"
              placeholder="Type your message here..."
              className={style.messageInput}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
            />
            <button
              className={style.sendButton}
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoChat;