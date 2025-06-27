import styles from "./match.module.css";
import RedButton from "./red-button/red-button.jsx"
import BottomBar from "./bottombar/bottombar.jsx";
import { useState, useEffect, useContext } from "react";
import {AppContext} from "../App.jsx";


//checker if we have already made a list
//*change the jwt key later pls

export default function Match(){
    //*change later to use env variables
    const items = ["🎈","🎄","🧤","🧶","🎩","🏈","👟","🍕","🍔","🍟","🚑","👓","🎃","🎀"];

    //*all usernames of all players
    const [players, setPlayers] = useState(["player 1", "player 2"]);

    //client list rendering
    
    const [myUID] = useState(()=>Math.floor(Math.random() * 10));

    const {list, setList} = useContext(AppContext);

    
    return (
        <div className={styles.above}>
        
            <div className={styles.center}>
                <RedButton/>
                <BottomBar list={list} setList={setList}/>
            </div>

        </div>
    )
}