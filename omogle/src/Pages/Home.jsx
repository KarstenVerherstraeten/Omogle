import React from "react";
import { Link } from "react-router-dom";
import style from "../Modules/Home.module.css";

function Home() {
	return (
		<>
			<div className={style.Logo}>
				<h1>Omogle</h1>
			</div>
			<div className={style.body}>
                <div className={style.Disclaimer}>
                <p>
					These video chats are not monitored in any way or form. Participants
					engage at their own risk. Please be aware of the content you may
					encounter during your interactions. We strongly advise that you
					supervise your children while using this platform to ensure their
					safety and well-being.
				</p>
                </div>
				

				<Link to="/chat">
					<button>Enter Omogle</button>
				</Link>
			</div>
		</>
	);
}

export default Home;
