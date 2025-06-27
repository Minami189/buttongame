import styles from "./start.module.css";
import {useRef, useEffect, useState, useContext} from "react"
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";
import {nanoid} from "nanoid";
import { jwtDecode } from "jwt-decode";



export default function Start(){
    const {socket, instanceID} = useContext(AppContext);
    const roomInput = useRef(); 
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    useEffect(()=>{
        socket.on("attempt_join", (data)=>{
            if(data.success){
                //first remove any existing room
                localStorage.removeItem("roomID");

                //then remember the new room
                localStorage.setItem("roomID", data.roomID)

                //then go to lobby and go game_state lobby
                localStorage.setItem("game_state", "lobby")
                navigate("/lobby");
            }else{
                setMessage("couldn't find room")
                setTimeout(()=>{
                    setMessage("")
                }, 3000);
            }
        })

        return(()=>{
            socket.off("attempt_join");
        })
    },[])

    function handleJoinRoom(){
        const room = roomInput.current.value;
        socket.emit("join_room", {roomID: room});
    }

    function handleCreateRoom(){
        const roomID = nanoid(5);
        const token = localStorage.getItem("instanceToken");
        const decoded = jwtDecode(token);
        
        socket.emit("create_room", {roomID: roomID, host: decoded.instanceID});
        navigate("/lobby");
        //game state change

        //remove any pre-existing room
        localStorage.removeItem("roomID");


        //remember the new room
        localStorage.setItem("roomID", roomID);
    }

    return(
        <div className={styles.roomsWrapper}>
            <h1 className={styles.gameTitle}>
                Game Title
            </h1>

            <div className={styles.buttonsWrapper}>
                
                <div className={styles.joinRoom}>
                    <h1>Create a Room</h1>
                    <button onClick={()=>handleCreateRoom()}>Create</button>

                    <h1 style={{marginTop: "55px"}}>Join a Room</h1>
                    <input placeholder="Room ID" ref={roomInput}/>
                    <button onClick={()=>handleJoinRoom()}>Join</button>
                    <p style={{color:"red", fontSize:"1rem", textAlign:"center", display:"inline", margin:"0px", marginTop:"1rem"}}>{message}</p>
                    
                </div>

            </div>
            
        </div>
    )
}