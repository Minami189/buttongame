import styles from "./item.module.css";
import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io.connect(import.meta.env.VITE_BACKEND_URL)


export default function Item({showItems, setShowItems}){
const items = ["🎈","🎄","🧤","🧶","🎩","🏈","👟","🍕","🍔","🍟","🚑","👓","🎃","🎀"];
const [selected, setSelected] = useState([0]);
const [positionx, setPositionx] = useState([0])
const [positiony, setPositiony] = useState([0])




useEffect(()=>{
    socket.on("populate_items", (data)=>{
    setSelected(data.chosenItems);
    setPositionx(data.positionx);
    setPositiony(data.positiony);
    setShowItems(true)
    })

    socket.on("item_claimed", (data)=>{
        itemDelete(data.claim_index)
    })

    return(()=>{
    socket.off("populate_items");
    socket.off("item_claimed");
    })

},[socket])

    function handleClick(index, item) {
        socket.emit("click_item", {clickedindex: index}); 
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