import styles from "./login.module.css";
import { useContext, useEffect } from "react";
import { AppContext } from "../App";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

export default function Login() {
  // change later to be an input
  let displayName = "Player 1";

  const navigate = useNavigate();
  const { setInstanceID, socket } = useContext(AppContext);

  useEffect(() => {
    socket.on("generate_token", (data) => {
      const token = data.instanceToken;
      localStorage.setItem("instanceToken", token);

      const decoded = jwtDecode(token);
      console.log("Decoded payload:", decoded);

      const generatedInstanceID = decoded.instanceID;
        
      // then setInstanceID globally
      setInstanceID(generatedInstanceID);
      generateList()
    });

    socket.on("render_list", (data)=>{
      setList(data.generatedList);
      console.log("rendered list: " + data.generatedList);
    })

    return () => {
      socket.off("generate_token");
      socket.off("render_list");
    };
  }, []);

  function handleCreate() {
    localStorage.clear();
    socket.emit("login", { instanceDisplayName: displayName });
    navigate("/start");
  }

  function handlePlay(){
   
    const token = localStorage.getItem("instanceToken");
    if(token){
      generateList()
      navigate("/start");
    }else{
      alert("create instance first");
    }
  }

  function generateList(){
        const token = localStorage.getItem("instanceToken");
        const decoded = jwtDecode(token);
        socket.emit("generate_list", {instanceID: decoded.instanceID});
        console.log("list being generated")
    }

  return (
    <div className={styles.loginWrapper}>
      <button onClick={handleCreate}>
        Create and Play
      </button>

      <button onClick={() => handlePlay()}>
        Play
      </button>
    </div>
  );
}
