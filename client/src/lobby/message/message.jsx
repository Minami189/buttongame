import styles from "./message.module.css"
import { useContext, useEffect } from "react"
import { AppContext } from "../../App.jsx";
import message_received from "../../assets/message_received.mp3";

export default function Message({name, content, avatar}){
    const {avatars} = useContext(AppContext);
    useEffect(()=>{
        const message_receive = new Audio(message_received);
        message_receive.volume = 0.5;
        message_receive.play();
    }, [])  
    
    return(
        <div className={styles.messageWrapper}>

            <div className={styles.identifier}>
                <img src={avatars[avatar]}/>
            </div>
            
            <div style={{width:"100%"}}>
                <p className={styles.messagerName}>{name}</p>
                <p className={styles.messageContent}>{content}</p>
            </div>
            
        </div>
    )
}