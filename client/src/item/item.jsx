import styles from "./item.module.css";
import { useEffect, useState, useContext } from "react";
import {AppContext} from "../App.jsx";
import { jwtDecode } from "jwt-decode";

export default function Item({selected, setSelected}){
const {socket} = useContext(AppContext);
//*change later to use env variables
const items = ["🎈","🎄","🧤","🧶","🎩","🏈","👟","🍕","🍔","🍟","🚑","👓","🎃","🎀"];



//list and setList from match component
const {list, setList} = useContext(AppContext);


useEffect(()=>{
    socket.emit("get_items", {roomID: localStorage.getItem("roomID")})

    socket.on("render_items", (data)=>{
        setSelected(data.activeItems);
    })

    socket.on("populate_items", (data)=>{
        setSelected(data.activeItems);
    })

    socket.on("item_claimed", (data)=>{
        const token = localStorage.getItem("instanceToken");
        const decoded = jwtDecode(token);
        const instanceID = decoded.instanceID;
        //only the player who clicked will update their list in bottombar

        if(data.instanceID == instanceID){
            setList(data.list);
        }

        //delete for everyone 
        itemDelete(data.claim_index);
    })

    

    return(()=>{
        socket.off("populate_items");
        socket.off("item_claimed");
    })

},[])

    function handleClick(index, item) {
        const token = localStorage.getItem("instanceToken");
        const decoded = jwtDecode(token);
        const instanceID = decoded.instanceID;
        socket.emit("click_item", {clickedindex: index, instanceID: instanceID, clickedItem: item, list: list, roomID:localStorage.getItem("roomID")}); 
    }

    function itemDelete(index){
        //removing the clicked item based on its index
        setSelected(prev => prev.filter((_, i) => i !== index));
    }

    return(
        <div className={styles.showing}  id="itemWrapper">
            {
                selected.map((v, i)=>{
                    const p = ( v.positiony * ((window.innerHeight * 0.8) - 250)) + "px";
                    const p2 = ( v.positionx * (window.innerWidth - 250)) + "px";
                    console.log(items[v.chosen]);
                    return(
                    <div key={`item-${i}`} className={styles.Item} style={{top: p, left: p2}} onClick={()=>handleClick(i, items[v.chosen])}>
                        {items[v.chosen]}
                    </div>
                    );
                })
            }
        </div>
    )
}