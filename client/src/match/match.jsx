import styles from "./match.module.css";
import RedButton from "./red-button/red-button.jsx"
import BottomBar from "./bottombar/bottombar.jsx";
import { useState, useEffect, useContext } from "react";
import {AppContext} from "../App.jsx";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

//checker if we have already made a list
//*change the jwt key later pls

export default function Match(){
    //*change later to use env variables
    const items = ["🎈","🎄","🧤","🧶","🎩","🏈","👟","🍕","🍔","🍟","🚑","👓","🎃","🎀"];
    const {list, setList, socket, state, setState} = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(()=>{

        const roomID = localStorage.getItem("roomID")
        if(roomID.length >= 1){
            socket.emit("check_state", {roomID: roomID});
        }
        
        socket.on("update_state", (data)=>{
            setState(data.state);

            if (data.state=="lobby"){
                console.log("state: " + state)
                navigate("/lobby");
            }else if (data.state=="end"){
                console.log("state: " + state)
                navigate("/end");
            }

            //every reload we fetch the list 
            const token = localStorage.getItem("instanceToken");
            const decoded = jwtDecode(token);
            if(list.length <= 0 || list === null){
                socket.emit("get_list", {instanceID: decoded.instanceID});
            }
        })

        socket.on("refresh_list", (data)=>{
            if(data.list !== undefined && data.list !== null){
                setList(data.list);
            }
        })

        socket.on("change_state", (data)=>{
            setState(data.state);
            console.log("changed state to " + data.state);
        })

        
    }, [])
    
    if(state == "loading"){
        const roomID = localStorage.getItem("roomID");
        if(roomID == undefined || roomID == null || roomID == ""){
            navigate("/start");
        }
        return(<div>Loading...</div>)
    }
    else if(state == "match"){
        return (
            <div className={styles.above}>
            
                <div className={styles.center}>
                    <RedButton/>
                    <BottomBar/>
                </div>

            </div>
        )
    }
}