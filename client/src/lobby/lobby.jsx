import styles from "./lobby.module.css";
import {useState, useEffect, useRef} from "react";
import Message from "./message/message.jsx";
import {useContext} from "react";
import {AppContext} from "../App.jsx";

export default function Lobby(){
    const socket = useContext(AppContext);

    //*placeholder change later to the username in localstorage/JWT
    const username = "Player 1";

    const [messages, setMessages] = useState([{}]);
    const message = useRef();

    useEffect(()=>{
        socket.on("update_messages", (data)=>{
            setMessages((prev)=> prev.concat({name:data.senderName, content:data.content}))
            console.log("messages updated...");
        })

        return(()=>{
            socket.off("update_messages");
        })

    },[])

    function handleSubmit(e){
        e.preventDefault();
        updateMessages();
    }

    function updateMessages(){

        if(message.current.value != ""){
            socket.emit("send_message", {name:username, content:message.current.value, roomID: localStorage.getItem("roomID")});    
        }

    }

    return(
        <div className={styles.lobbyWrapper}>
            <div className={styles.blur}>

                <div className={styles.chatWrapper}>
                    <div className={styles.messages}>
                        {
                            messages.map((v,i)=>{
                                //if statement for when in the beginning it is undefined
                                if(v.name != undefined){
                                    return(
                                        <Message name={v.name} content={v.content}/>
                                    )
                                }
                            })
                        }
                        
                        
                    </div>

                    <form onSubmit={handleSubmit}>
                        <input placeholder="Message" ref={message}/>
                    </form>        
                        
                </div>

            </div>
        </div>
    )
}