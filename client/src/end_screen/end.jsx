import styles from "./end.module.css";
import { useNavigate} from "react-router-dom";
import { useEffect } from "react";

export default function End(){
    const navigate = useNavigate();
    function handlePlayAgain(){
        console.log("Play Again")
    }

    function handleNewRoom(){
        console.log("New Room")
    }

    console.log(localStorage.getItem("game_state") === "end");

    if(localStorage.getItem("game_state") === "end"){
        
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
    }else{

        //this puts back to match game state when the game hasn't really ended yet
        //prevents people from going to end route
        console.log("not ended")
        useEffect(()=>{
            navigate("/");
        }, [])
    }
    
}

