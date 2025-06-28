import styles from "./item.module.css";
import { useEffect, useState, useContext } from "react";
import {AppContext} from "../App.jsx";
import { jwtDecode } from "jwt-decode";
export default function Item({showItems, setShowItems}){
const {socket} = useContext(AppContext);
//*change later to use env variables
const items = ["🎈","🎄","🧤","🧶","🎩","🏈","👟","🍕","🍔","🍟","🚑","👓","🎃","🎀"];
const [selected, setSelected] = useState([0]);
const [positionx, setPositionx] = useState([0])
const [positiony, setPositiony] = useState([0])

//list and setList from match component
const {list, setList} = useContext(AppContext);


useEffect(()=>{
    socket.on("populate_items", (data)=>{
        setSelected(data.chosenItems);
        setPositionx(data.positionx);
        setPositiony(data.positiony);
        setShowItems(true)
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
        setPositionx(prev => prev.filter((_, i) => i !== index));
        setPositiony(prev => prev.filter((_, i) => i !== index));
    }

    return(
        <div className={showItems ? styles.showing : styles.notshowing} id="itemWrapper">
            {
                selected.map((v, i)=>{
                    const p = (positiony[i] * ((window.innerHeight * 0.8) - 250)) + "px";
                    const p2 = (positionx[i] * (window.innerWidth - 250)) + "px";

                    return(<div key={i} className={styles.Item} style={{top: p, left: p2}} onClick={()=>handleClick(i, items[v])}>{items[v]}</div>);
                })
            }
        </div>
    )
}