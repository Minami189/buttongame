import styles from "./start.module.css";
import {useRef, useEffect, useState} from "react"
import { useNavigate } from "react-router-dom";
import {nanoid} from "nanoid";




export default function Start({socket}){
    
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

                //then go to lobby
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
        socket.emit("create_room", {roomID: roomID});
        navigate("/lobby");
        //first remove any existing room
        localStorage.removeItem("roomID");

        //then remember the new room
        localStorage.setItem("roomID", roomID);
    }

    return(
        <div className={styles.roomsWrapper}>
            <h1 className={styles.gameTitle}>
                Game Title
            </h1>

            <div className={styles.buttonsWrapper}>
                
                
                <div className={styles.createRoom}>
                    <h1>Create a Room</h1>
                    <div className={styles.settingsWrapper}>
                        <div className={styles.segmenter}>
                            <label>timer:</label>
                            <input name="timer" type="number" max="20" min="5"/>
                        </div>
                        
                        <div className={styles.segmenter}>
                            <label>list size:</label>
                            <input name="list size" type="number" max="10" min="1"/>
                        </div>
                    </div>
                    
                    <button onClick={handleCreateRoom}>Create</button>
                </div>
                

                <div className={styles.joinRoom}>
                    <h1>Join a Room</h1>
                    <input placeholder="Room ID" ref={roomInput}/>
                    <button onClick={()=>handleJoinRoom()}>Join</button>
                    <p style={{color:"red", fontSize:"1rem", textAlign:"center", display:"inline", margin:"0px", marginTop:"1rem"}}>{message}</p>
                </div>

            </div>
            
        </div>
    )
}