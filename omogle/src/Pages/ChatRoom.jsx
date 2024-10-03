// WebRTC Hook by chatGPT: https://chatgpt.com/share/66fd3912-ce74-800f-bfa4-0469e560a4de
import React, { useEffect, useRef } from "react";
import { useWebRTC } from "../Components/useWebRTC"; // The hook you created
import style from "../Modules/ChatRoom.module.css";

const VideoChat = ({ socketUrl }) => {
	const { localStream, remoteStream } = useWebRTC(socketUrl);
	const localVideoRef = useRef(null); // Create a ref for the local video element
	const remoteVideoRef = useRef(null); // Create a ref for the remote video element

	useEffect(() => {
		// Attach local stream to the video element when it becomes available
		if (localStream && localVideoRef.current) {
			localVideoRef.current.srcObject = localStream;
		}
	}, [localStream]);

	useEffect(() => {
		// Attach remote stream to the video element when it becomes available
		if (remoteStream && remoteVideoRef.current) {
			remoteVideoRef.current.srcObject = remoteStream;
		}
	}, [remoteStream]);

	return (

        <><div className={style.Logo}>
        <h1>Omogle</h1>
    </div>
		<div className={style.VideoFeeds}>
            <div className={style.LocalVideo}>
            <h2>Local Video</h2>
			<video
				ref={localVideoRef}
				autoPlay
				playsInline
				muted // Mute to avoid feedback loop
				style={{
					width: "300px",
					border: "1px solid black",
					transform: "rotateY(180deg)",
				}}
			/>
            </div>
			

            <div className={style.RemoteVideo}>
            <h2>Remote Video</h2>
			<video
				ref={remoteVideoRef}
				autoPlay
				playsInline
				style={{ width: "300px", border: "1px solid black" }}
			/>
            </div>
			
		</div>

        <div className={style.Chat}>
             <div className={style.Messages}>

             </div>

             <div className={style.Message}>
                    <input type="text" placeholder="Type your message here..." />
                    <button>Send</button>
             </div>

        </div>
        </>
	);
};

export default VideoChat;
