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
    const [denied, setDenied] = useState(true);
    const navigate = useNavigate();

    useEffect(()=>{

        socket.emit("check_state", {roomID: localStorage.getItem("roomID")});

        socket.on("update_state", (data)=>{
            setState(data.state);
            console.log("state set to " + data.state)
        })

        //every reload we fetch the list 
        const token = localStorage.getItem("instanceToken");
        const decoded = jwtDecode(token);
        if(list.length <= 0 || list[0].item == "error"){
            socket.emit("get_list", {instanceID: decoded.instanceID});
        }

        socket.on("refresh_list", (data)=>{
            if(data.list !== undefined && list.item !== "error"){
                setList(data.list);
                console.log(data.list);
                setDenied(false);
            }else{
                setDenied(true);
            }        
        })

        socket.on("change_state", (data)=>{
            setState(data.state);
            console.log("changed state to " + data.state);
        })

        console.log("refresh lol")
    }, [])
    
    if(state == "loading"){
        return(<div>Loading...</div>)
    }
    else if(state == "match"){
        if(denied == true){
            return(
                <div>
                    Game already in progress...
                </div>
            )
        }
        return (
            <div className={styles.above}>
            
                <div className={styles.center}>
                    <RedButton/>
                    <BottomBar/>
                </div>

            </div>
        )
    }else if (state=="lobby"){
        console.log("state: " + state)
        navigate("/lobby");
    }else if (state=="end"){
        console.log("state: " + state)
        navigate("/end");
    }
    
}