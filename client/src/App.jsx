import Match from "./match/match.jsx";
import End from "./end_screen/end.jsx";
import Start from "./start/start.jsx";
import Lobby from "./lobby/lobby.jsx";
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import { createContext, useEffect } from "react";
import io from "socket.io-client";

const socket = io.connect(import.meta.env.VITE_BACKEND_URL);

export const AppContext = createContext();


function App() {
  useEffect(()=>{
    const roomID = localStorage.getItem("roomID");

    if(roomID != ""){
      socket.emit("join_room", {roomID: roomID});
    }
  },[])
  return (
    <AppContext.Provider value={socket}>
      <BrowserRouter>
        <Routes>
          <Route index element={<Start socket={socket}/>}></Route>
          <Route path="/match" element={<Match/>}/>
          <Route path="/end" element={<End/>}/>
          <Route path="/lobby" element={<Lobby/>}/>
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  )
}

export default App
