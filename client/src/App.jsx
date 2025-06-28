import Match from "./match/match.jsx";
import End from "./end_screen/end.jsx";
import Start from "./start/start.jsx";
import Lobby from "./lobby/lobby.jsx";
import Login from "./login/login.jsx";
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import { createContext, useEffect, useState } from "react";
import io from "socket.io-client";
import {nanoid} from "nanoid";


const socket = io.connect(import.meta.env.VITE_BACKEND_URL);

export const AppContext = createContext();


function App() {
  const [list, setList] = useState([{item: "error", taken: false}]);
  const [instanceID, setInstanceID] = useState();
  const [state, setState] = useState("loading");
  const secret_jwt_key = import.meta.env.VITE_JWT_TOKEN;

  useEffect(()=>{
    if(localStorage.getItem("roomID")){
      socket.emit("join_room", {roomID: localStorage.getItem("roomID")});
    }
  },[socket])
 
  return (
    <AppContext.Provider value={{socket, list, setList, instanceID, setInstanceID, secret_jwt_key, state, setState}}>
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
