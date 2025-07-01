import styles from './red-button.module.css';
import { useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import Item from "../../item/item.jsx"
import {useContext} from "react";
import {AppContext} from "../../App.jsx";
import { jwtDecode } from 'jwt-decode';
import button from "../../assets/button.mp3"


export default function RedButton(){
    const {socket, winner, setWinner, avatars} = useContext(AppContext);
    const [selected, setSelected] = useState([]);
    const [active, setActive] = useState(false)
    const [message, setMessage]= useState("");
    const [timer, setTimer] = useState();
    const [activeNotif, setActiveNotif] = useState(false);
    const [avatar, setAvatar] = useState();
    const [disable, setDisable] = useState(false);
    const navigate = useNavigate();

    //change later to whatever the username is



    //client change for the clicker
    function buttonClick(){
        if(!disable){
                setDisable(true);
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
                const avatar = decoded.avatar;
                socket.emit("button_press", {displayName: displayName, roomID: localStorage.getItem("roomID"), avatar: avatar });
                notify("You pressed the button!", avatar);
            }
        }
        
    }


    //client change for other players
    function notify(message, avatar){
        const buttonAudio = new Audio(button);
        buttonAudio.volume = 1;
        buttonAudio.play();
        setMessage(message);
        setAvatar(avatar);
        setActive(true);
        console.log("avatar is now : " + avatar);
        setSelected([]);
        //reset button after 2s
        setTimeout(() => {
            setMessage("");
            setAvatar();
            setDisable(false);
            setActive(false);
        }, 2000);
    }

    useEffect(()=>{
        socket.emit("get_time", {roomID: localStorage.getItem("roomID")});

        socket.on("notify_press", (data)=>{
            notify(data.message, data.avatar);
        })

        socket.on("timer_tick", (data)=>{
            setTimer(data.time);
        })

        //listener to when a player wins
        socket.on("game_end", (data)=>{
            console.log("game ended with " + data.avatar + data.displayName);
            setWinner({avatar: data.avatar, displayName: data.displayName});
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
            <div className={styles.visible}><img src={avatars[avatar]}/>{message}</div>
            <div className={active ? styles.active : styles.buttonHead}/>
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