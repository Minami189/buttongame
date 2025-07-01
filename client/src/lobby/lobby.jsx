import styles from "./lobby.module.css";
import {useState, useEffect, useRef} from "react";
import Message from "./message/message.jsx";
import {useContext} from "react";
import {useNavigate} from "react-router-dom"
import {nanoid} from "nanoid"
import {AppContext} from "../App.jsx";
import { jwtDecode } from "jwt-decode";
import start from "../assets/start.mp3";
export default function Lobby(){
    const {socket, list, setList, instanceID, state, setState} = useContext(AppContext);
    const navigate = useNavigate();
    const end = useRef();
    const [length, setLength] = useState(0);
    
    const token = localStorage.getItem("instanceID");
    let decoded;
    if(token){
        decoded = jwtDecode(localStorage.getItem("instanceID"));
    }

    //*placeholder change later to the username in localstorage/JWT


    //instanceID here represents the ID of the user to maintain their list
    
    const [messages, setMessages] = useState([{}]);
    const message = useRef();

    function handleChange(){
        const msglength = message.current.value.length;
        setLength(msglength);
    }

    useEffect(()=>{

        if(state == "match"){
            navigate("/match");
        }else if (state == "end"){
            navigate("/end");
        }

        socket.emit("check_state", {roomID: localStorage.getItem("roomID")});

        socket.on("update_state", (data)=>{
            setState(data.state);
            console.log("updated state to " + data.state);
            if(data.state == "match"){
                navigate("/match");
            }else if (data.state == "end"){
                navigate("/end");
            }
        })

        //check roomState on render
        socket.on("update_messages", (data)=>{
            setMessages((prev)=> prev.concat({name:data.senderName, content:data.content, avatar: data.avatar}))
            console.log("messages updated...");
        })

        socket.on("begin_game", ()=>{
            const start_audio = new Audio(start);
            start_audio.play();

            setState("match");
            //create list for all when game has started
            generateList();
        })

        socket.on("render_list", (data)=>{
            setList(data.generatedList);
            console.log("rendered list: " + data.generatedList);
        })
        
        if(list.length > 0 ){
            navigate("/match");
        }
        

        return(()=>{
            socket.off("update_messages");
            socket.off("begin_game");
            socket.off("render_list");
        })

    },[])

    
        useEffect(() => {
            if (end.current) {
                end.current.scrollIntoView({ behavior: "smooth" });
            }
        }, [messages]);


    function handleSubmit(e){
        e.preventDefault();
        updateMessages();
    }

    function updateMessages(){
        const token = localStorage.getItem("instanceToken");
        const decoded = jwtDecode(token);
        const displayName = decoded.displayName;
        const avatar = decoded.avatar;
        setLength(0);
        //update messages to all in this room with roomID
        if(message.current.value != ""){
            socket.emit("send_message", {name:displayName, content:message.current.value, roomID: localStorage.getItem("roomID"), avatar: avatar});   
            message.current.value = ""; 
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

    function generateList(){
        const token = localStorage.getItem("instanceToken");
        const decoded = jwtDecode(token);
        const avatar = decoded.avatar;
        const displayName = decoded.displayName;
        socket.emit("generate_list", {instanceID: decoded.instanceID, avatar:avatar,displayName:displayName});
    }

    if(state == "loading"){
        const roomID = localStorage.getItem("roomID");
        if(roomID == undefined || roomID == null || roomID == ""){
            navigate("/start");
        }
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
                                            <Message name={v.name} content={v.content} avatar={v.avatar}/>
                                        )
                                    }
                                })
                            }
                            <div ref={end}/>
                            
                        </div>

                        <form onSubmit={handleSubmit}>
                            <input placeholder="Message" ref={message} maxLength={70} onChange={handleChange}/>
                            <div className={styles.msgLength}>{`${length}/70`}</div>
                         
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
    }
    
}