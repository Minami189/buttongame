import styles from "./end.module.css";
import { useNavigate} from "react-router-dom";
import { useEffect, useContext } from "react";
import { AppContext } from "../App";
import { jwtDecode } from "jwt-decode";
import endsound from "../assets/end.mp3";
import uiClickSound from "../assets/ui-click.mp3"
export default function End(){
    const navigate = useNavigate();
    const {state, setState, socket, winner, avatars} = useContext(AppContext);

    useEffect(()=>{
        const end = new Audio(endsound);
        end.play();
    
        socket.emit("check_state", {roomID: localStorage.getItem("roomID")});
        console.log("refreshing at the end lol")
        
        socket.on("update_state", (data)=>{
            setState(data.state);
            if(data.state == "lobby"){
                navigate("/lobby")
            }else if(data.state == "match"){
                navigate("/match")
            }
        })

        socket.on("not_host", ()=>{
            alert("only the host can choose to play again");
        })

        return(()=>{
            socket.off("update_state");
            socket.off("not_host");
        })
    },[])
    

    function handleNewRoom(){
        const uiClick = new Audio(uiClickSound);
        uiClick.play()
        localStorage.removeItem("roomID");
        navigate("/start")
    }

    console.log(localStorage.getItem("game_state") === "end");

    if (state == "loading"){
        const roomID = localStorage.getItem("roomID");
        if(roomID == undefined || roomID == null || roomID == ""){
            navigate("/start");
        }
        return(
            <div>Loading...</div>
        )
    }
    else if(state == "end"){
        return(
        //the div outside is just to make everything above the background stars
        <div className={styles.endWrapper} style={{zIndex: 5, position: "relative"}}>
            <div className={styles.blackbar}>
                <img src={avatars[winner.avatar]}/><h1>{winner.displayName} WON</h1>
            </div>

            <div className={styles.buttonsWrapper2}>
                <button className={styles.newRoomButton} onClick={()=>handleNewRoom()}>New Room</button>
            </div>
            
        </div>
        )
    }
    
}

