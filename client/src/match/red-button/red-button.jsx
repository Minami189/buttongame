import styles from './red-button.module.css';
import { useState, useEffect } from "react";
import io from "socket.io-client";
const socket = io.connect("http://localhost:3000");

export default function RedButton(){
    const [active, setActive] = useState(false)
    const [message, setMessage]= useState("");
    const [timer, setTimer] = useState()
    const [activeNotif, setActiveNotif] = useState(false);
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
        setActiveNotif(true)

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

        return(()=>{
            socket.off("notify_press");
            socket.off("timer_tick")
        })
        
    }, [socket])

    return(
        <div className={styles.buttonWrapper} onClick={()=>buttonClick()}>
            <div className={activeNotif ? styles.visible : styles.invisible}>{message}</div>
            <div className={active ? styles.active : styles.buttonHead}>
            </div>
            <div className={styles.buttonBase}>
                <h1>{timer}</h1>
            </div>
        </div>
    )
}