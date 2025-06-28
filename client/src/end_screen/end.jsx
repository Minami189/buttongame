import styles from "./end.module.css";
import { useNavigate} from "react-router-dom";
import { useEffect, useContext } from "react";
import { AppContext } from "../App";

export default function End(){
    const navigate = useNavigate();
    const {state, setState, socket} = useContext(AppContext);

    useEffect(()=>{
        socket.emit("check_state", {roomID: localStorage.getItem("roomID")});

        socket.on("update_state", (data)=>{
            setState(data.state);
            console.log("state set to " + data.state)
        })

        return(()=>{
            socket.off("update_state");
        })
    },[])
    

    function handlePlayAgain(){
        console.log("Play Again")
    }

    function handleNewRoom(){
        console.log("New Room")
    }

    console.log(localStorage.getItem("game_state") === "end");

    if (state == "loading"){
        return(
            <div>Loading...</div>
        )
    }
    else if(state == "end"){
        return(
        //the div outside is just to make everything above the background stars
        <div className={styles.endWrapper} style={{zIndex: 5, position: "relative"}}>
            <div className={styles.blackbar}>
                <h1>PLAYER WON</h1>
            </div>

            <div className={styles.buttonsWrapper}>
                <button onClick={()=>handlePlayAgain()}>Play Again</button>
                <button onClick={()=>handleNewRoom()}>New Room</button>
            </div>
            
        </div>
        )
    }else if(state == "lobby"){
        navigate("/lobby")
    }else if(state == "match"){
        navigate("/match")
    }
    
}

