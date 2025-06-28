import styles from "./lobby.module.css";
import {useState, useEffect, useRef} from "react";
import Message from "./message/message.jsx";
import {useContext} from "react";
import {useNavigate} from "react-router-dom"
import {nanoid} from "nanoid"
import {AppContext} from "../App.jsx";
import { jwtDecode } from "jwt-decode";

export default function Lobby(){
    const {socket, list, setList, instanceID, state, setState} = useContext(AppContext);
    const navigate = useNavigate();

    
    
    const token = localStorage.getItem("instanceID");
    let decoded;
    if(token){
        decoded = jwtDecode(localStorage.getItem("instanceID"));
    }

    //*placeholder change later to the username in localstorage/JWT
    const username =  "Player 1";

    //instanceID here represents the ID of the user to maintain their list
    
    const [messages, setMessages] = useState([{}]);
    const message = useRef();

    useEffect(()=>{

        socket.emit("check_state", {roomID: localStorage.getItem("roomID")});

        socket.on("update_state", (data)=>{
            setState(data.state);
            console.log("state set to " + data.state)
        })

        //check roomState on render
        socket.on("update_messages", (data)=>{
            setMessages((prev)=> prev.concat({name:data.senderName, content:data.content}))
            console.log("messages updated...");
        })

        socket.on("begin_game", ()=>{
            console.log("begin")
            setState("match");
            //create list for all when game has started
            genereateList();
        })

        socket.on("render_list", (data)=>{
            setList(data.generatedList);
            navigate("/match");
        })
        
        

        return(()=>{
            socket.off("update_messages");
            socket.off("begin_game");
            socket.off("render_list");
        })

    },[])

    function handleSubmit(e){
        e.preventDefault();
        updateMessages();
    }

    function updateMessages(){
        //update messages to all in this room with roomID
        if(message.current.value != ""){
            socket.emit("send_message", {name:username, content:message.current.value, roomID: localStorage.getItem("roomID")});    
        }
    }

    function copyRoomID(){
        navigator.clipboard.writeText(localStorage.getItem("roomID"));
        alert("copied roomID to clipboard");
    }

    function handleStart(){
        const token = localStorage.getItem("instanceToken");
        const decoded = jwtDecode(token);
        socket.emit("start_game", {roomID: localStorage.getItem("roomID"), instanceID: decoded.instanceID});
    }

    function genereateList(){
        const token = localStorage.getItem("instanceToken");
        const decoded = jwtDecode(token);
        socket.emit("generate_list", {instanceID: decoded.instanceID});
    }

    if(state == "loading"){
        return(<div>Loading...</div>)
    }
    else if(state == "lobby"){
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


                    <div className={styles.settingsWrapper}>  
                        <div className={styles.settingHeader}>
                            <h1 className={styles.roomTitle}>Room ID:</h1>
                            <h1 className={styles.roomID} onClick={()=>copyRoomID()}>{localStorage.getItem("roomID")}</h1>
                        </div>
                        

                        <button className={styles.startButton} onClick={()=>handleStart()}>START</button>
                    </div>
                </div>
            </div>
        )
    }else if(state=="match"){
        navigate("/match");
    }else if (state=="end"){
        navigate("/end");
    }else{
        console.log("Unknown state: " + state);
    }
    
}