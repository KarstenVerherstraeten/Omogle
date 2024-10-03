import React from "react";
import { Link } from "react-router-dom";
import style from "../Modules/Home.module.css";

function Home() {
    return (
        <>
            <div className={style.container}>
                <header className={style.header}>
                    <div className={style.logoContainer}>
                        <h1 className={style.logo}>Omogle</h1>
                    </div>
                </header>
                
                <div className={style.body}>
                    <div className={style.disclaimerContainer}>
                        <p className={style.disclaimerText}>
                            These video chats are not monitored in any way or form.
                            Participants engage at their own risk. Please be aware of the 
                            content you may encounter during your interactions. We strongly 
                            advise that you supervise your children while using this platform 
                            to ensure their safety and well-being.
                        </p>
                    </div>

                    <Link to="/chat">
                        <button className={style.enterButton}>Enter Omogle</button>
                    </Link>
                </div>
            </div>
        </>
    );
}

export default Home;