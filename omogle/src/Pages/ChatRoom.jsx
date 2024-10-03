import React, { useEffect, useRef } from "react";
import { useWebRTC } from "../Components/useWebRTC";
import style from "../Modules/ChatRoom.module.css";

const VideoChat = ({ socketUrl }) => {
	const { localStream, remoteStream } = useWebRTC(socketUrl);
	const localVideoRef = useRef(null);
	const remoteVideoRef = useRef(null);

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
						{/* Messages will be displayed here */}
					</div>

					<div className={style.messageInputContainer}>
						<input
							type="text"
							placeholder="Type your message here..."
							className={style.messageInput}
						/>
						<button className={style.sendButton}>Send</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default VideoChat;