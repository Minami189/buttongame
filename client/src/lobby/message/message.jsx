import styles from "./message.module.css"
import { useContext } from "react"
import { AppContext } from "../../App.jsx";


export default function Message({name, content, avatar}){
    const {avatars} = useContext(AppContext);

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