import styles from "./item.module.css";
import { useEffect, useState, useContext } from "react";
import {MatchContext} from "../match/match.jsx";

import {AppContext} from "../App.jsx";

export default function Item({showItems, setShowItems}){
const socket = useContext(AppContext);
//*change later to use env variables
const items = ["🎈","🎄","🧤","🧶","🎩","🏈","👟","🍕","🍔","🍟","🚑","👓","🎃","🎀"];
const [selected, setSelected] = useState([0]);
const [positionx, setPositionx] = useState([0])
const [positiony, setPositiony] = useState([0])

//list and setList from match component
const {list, setList, myUID} = useContext(MatchContext);


useEffect(()=>{
    socket.on("populate_items", (data)=>{
        setSelected(data.chosenItems);
        setPositionx(data.positionx);
        setPositiony(data.positiony);
        setShowItems(true)
    })

    socket.on("item_claimed", (data)=>{

        //only the player who clicked will update their list in bottombar
        if(data.playerUID == myUID){
            setList(data.list);
            localStorage.setItem("myItemList", JSON.stringify(data.list));
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
        socket.emit("click_item", {clickedindex: index, myUID: myUID, clickedItem: item, list: list}); 
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