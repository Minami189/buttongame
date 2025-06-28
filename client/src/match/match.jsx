import styles from "./match.module.css";
import RedButton from "./red-button/red-button.jsx"
import BottomBar from "./bottombar/bottombar.jsx";
import { useState, useEffect, useContext } from "react";
import {AppContext} from "../App.jsx";
import { jwtDecode } from "jwt-decode";

//checker if we have already made a list
//*change the jwt key later pls

export default function Match(){
    //*change later to use env variables
    const items = ["🎈","🎄","🧤","🧶","🎩","🏈","👟","🍕","🍔","🍟","🚑","👓","🎃","🎀"];
    const {list, setList, socket} = useContext(AppContext);
    useEffect(()=>{
        //every reload we fetch the list 
        const token = localStorage.getItem("instanceToken");
        const decoded = jwtDecode(token);
        if(list.length <= 0 || list[0].item == "error"){
            socket.emit("get_list", {instanceID: decoded.instanceID});
            console.log("getting list for " + decoded.instanceID)
        }

        socket.on("refresh_list", (data)=>{
            setList(data.list);
        })

    }, [])
    
    return (
        <div className={styles.above}>
        
            <div className={styles.center}>
                <RedButton/>
                <BottomBar/>
            </div>

        </div>
    )
}