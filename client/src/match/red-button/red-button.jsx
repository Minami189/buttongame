import styles from './red-button.module.css';
import { useState, useEffect } from "react";
import io from "socket.io-client";
import Item from "../../item/item.jsx"
const socket = io.connect(import.meta.env.VITE_BACKEND_URL);


export default function RedButton(){
    const [active, setActive] = useState(false)
    const [message, setMessage]= useState("");
    const [timer, setTimer] = useState()
    const [activeNotif, setActiveNotif] = useState(false);
    const [showItems, setShowItems] = useState(false);

    //change later to whatever the username is
    const UID = "Player 1";


    //client change for the clicker
    function buttonClick(){
        
        if(timer >= 1){
            
            setActiveNotif(true);
            setMessage("cannot press button yet!!!")
            setTimeout(() => {
                setActiveNotif(false);
            }, 1000);

        }else{
            socket.emit("button_press", {UID: UID});
            setActive(true);
            notify("You pressed the button!");
            
        }

        //reset button after 2s
        setTimeout(() => {
                setActive(false);
                setActiveNotif(false)
            }, 2000);
    }


    //client change for other players
    function notify(message){
        setMessage(message);
        setActive(true);
        setActiveNotif(true);
        setShowItems(false);

         //reset button after 2s
        setTimeout(() => {
                setActive(false);
                setActiveNotif(false)
            }, 2000);
    }

    useEffect(()=>{
        socket.on("notify_press", (data)=>{
            notify(data.message);
        })

        socket.on("timer_tick", (data)=>{
            setTimer(data.time);
        })

        //listener to when a player wins
        socket.on("game_end", (data)=>{
            alert(`player UID ${data.winnerUID} won the game`)
            localStorage.clear();
            //right now has the issue of not auto render/refresh
            //but will be fixed anw when going to the end game screen
        })

        return(()=>{
            socket.off("notify_press");
            socket.off("timer_tick")
            socket.off("game_end")
        })
        
    }, [])

    return(
    <div className={styles.wrapper}>
        <div className={styles.buttonWrapper} onClick={()=>buttonClick()}>
            <div className={activeNotif ? styles.visible : styles.invisible}>{message}</div>
            <div className={active ? styles.active : styles.buttonHead}>
            </div>
            <div className={styles.buttonBase}>
                <h1>{timer}</h1>
            </div>
        </div>

        <div className={showItems ? styles.showing : styles.notshowing}>
            <Item showItems={showItems} setShowItems={setShowItems}/>
        </div>
    </div>
        
    )
}