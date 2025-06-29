import styles from './red-button.module.css';
import { useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import Item from "../../item/item.jsx"
import {useContext} from "react";
import {AppContext} from "../../App.jsx";
import { jwtDecode } from 'jwt-decode';



export default function RedButton(){
    const {socket, winnerName, setWinnerName} = useContext(AppContext);
    const [selected, setSelected] = useState([]);
    const [active, setActive] = useState(false)
    const [message, setMessage]= useState("");
    const [timer, setTimer] = useState();
    const [activeNotif, setActiveNotif] = useState(false);
    const navigate = useNavigate();

    //change later to whatever the username is



    //client change for the clicker
    function buttonClick(){
        
        if(timer >= 1){
            setActiveNotif(true);
            setMessage("cannot press button yet!!!")
            setTimeout(() => {
                setActiveNotif(false);
            }, 1000);

        }else{
            const token = localStorage.getItem("instanceToken");
            const decoded = jwtDecode(token);
            const displayName = decoded.displayName;
            socket.emit("button_press", {displayName: displayName, roomID: localStorage.getItem("roomID")});
            setTimer(2);
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
        setSelected([]);
         //reset button after 2s
        setTimeout(() => {
                setActive(false);
                setActiveNotif(false)
            }, 2000);
    }

    useEffect(()=>{
        socket.emit("get_time", {roomID: localStorage.getItem("roomID")});

        socket.on("notify_press", (data)=>{
            notify(data.message);
        })

        socket.on("timer_tick", (data)=>{
            setTimer(data.time);
        })

        //listener to when a player wins
        socket.on("game_end", (data)=>{
            setWinnerName(data.displayName);
            navigate("/end");
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

        <div className={styles.showing}>
            <Item selected={selected} setSelected={setSelected}/>
        </div>
    </div>
        
    )
}