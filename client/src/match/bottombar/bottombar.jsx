import styles from './bottombar.module.css'
import { useEffect } from 'react'
import io from 'socket.io-client'
import {useContext} from "react";
import {AppContext} from "../../App.jsx";


export default function BottomBar({list, setList}){
    useEffect(()=>{
        

    },[])
    return(
        <div className={styles.bar}>
            {
                list.map((v, i)=>{
                    return(<div className={v.taken ? styles.itemHave : styles.itemList} id={`listItem-${i}`}>{v.item}</div>)
                })
            }
        </div>
    )
}