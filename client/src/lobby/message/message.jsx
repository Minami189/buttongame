import styles from "./message.module.css"

export default function Message({name, content}){
    return(
        <div className={styles.messageWrapper}>
            <p className={styles.messagerName}>{`${name}:`}</p>
            <div style={{width:"100%"}}>
                <p className={styles.messageContent}>{content}</p>
            </div>
            
        </div>
    )
}