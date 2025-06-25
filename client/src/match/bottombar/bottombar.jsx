import styles from './bottombar.module.css'
import { useEffect } from 'react'
import io from 'socket.io-client'
const socket = io.connect(import.meta.env.VITE_BACKEND_URL)


export default function BottomBar({list, setList}){
    useEffect(()=>{
        

    },[])
    return(
        <div className={styles.bar}>
            {
                list.map((v, i)=>{
                    return(<div className={v.taken ? styles.itemHave : styles.itemList} id={`itemList-${i}`}>{v.item}</div>)
                })
            }
        </div>
    )
}