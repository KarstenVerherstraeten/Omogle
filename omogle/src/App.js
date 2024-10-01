import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Chat from "./Pages/ChatRoom";


function App() {

	return (
		<Router>
			<Routes>
			
						<Route index element={<Home />} />
            <Route path="/chat" element={<Chat />} />
					
			</Routes>
		</Router>
	);
}

export default App; // Wrap App with the HOC