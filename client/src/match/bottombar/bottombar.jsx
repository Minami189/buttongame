import styles from './bottombar.module.css'
import { useEffect } from 'react'
import io from 'socket.io-client'
import {useContext} from "react";
import {AppContext} from "../../App.jsx";
import { jwtDecode } from 'jwt-decode';


export default function BottomBar(){
    const {list, setList, socket} = useContext(AppContext);

    useEffect(()=>{
        const roomID = localStorage.getItem("roomID");
        const token = localStorage.getItem("instanceToken");
        const decoded = jwtDecode(token);
        const instanceID = decoded.instanceID;
        socket.emit("get_players", {roomID: roomID, instanceID: instanceID});

        socket.on("update_players", (data)=>{
            setPlayers(data.otherPlayers);
        })

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