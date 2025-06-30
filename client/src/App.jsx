import Match from "./match/match.jsx";
import End from "./end_screen/end.jsx";
import Start from "./start/start.jsx";
import Lobby from "./lobby/lobby.jsx";
import Login from "./login/login.jsx";
import './index.css';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import { createContext, useEffect, useState } from "react";
import io from "socket.io-client";
import avatar1 from "./assets/avatar 1.png";
import avatar2 from "./assets/avatar 2.png";
import avatar3 from "./assets/avatar 3.png";
import avatar4 from "./assets/avatar 4.png";
import avatar5 from "./assets/avatar 5.png";
import avatar6 from "./assets/avatar 6.png";



const socket = io.connect(import.meta.env.VITE_BACKEND_URL);

export const AppContext = createContext();


function App() {
  const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6]
  const [list, setList] = useState([]);
  const [instanceID, setInstanceID] = useState();
  const [state, setState] = useState("loading");
  const secret_jwt_key = import.meta.env.VITE_JWT_TOKEN;

  //used to keep track of who won
  const [winnerName, setWinnerName] = useState();
  useEffect(()=>{
    if(localStorage.getItem("roomID")){
      socket.emit("join_room", {roomID: localStorage.getItem("roomID")});
    }
  },[socket])
 
  return (
    <AppContext.Provider value={{socket, list, setList, instanceID, setInstanceID, secret_jwt_key, state, setState, winnerName, setWinnerName, avatars}}>
      <BrowserRouter>
        <Routes>
          <Route index element={<Login/>}/>
          <Route path="/start" element={<Start/>}></Route>
          <Route path="/match" element={<Match/>}/>
          <Route path="/end" element={<End/>}/>
          <Route path="/lobby" element={<Lobby/>}/>
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  )
}

export default App
