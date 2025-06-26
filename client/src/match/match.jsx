import styles from "./match.module.css";
import RedButton from "./red-button/red-button.jsx"
import BottomBar from "./bottombar/bottombar.jsx";
import { useState, createContext, useEffect } from "react";


//checker if we have already made a list
//*change the jwt key later pls



export const MatchContext = createContext();
export default function Match(){
    //*change later to use env variables
    const items = ["🎈","🎄","🧤","🧶","🎩","🏈","👟","🍕","🍔","🍟","🚑","👓","🎃","🎀"];

    //*all usernames of all players
    const [players, setPlayers] = useState(["player 1", "player 2"]);

    //*setup later to use username from JWT
    const [myUID] = useState(()=>Math.floor(Math.random() * 10));


   
    

    //randomizes each player's list
    function generateRandomList(){
        const saved = localStorage.getItem("myItemList");

        if (saved) {
            return JSON.parse(saved);
        }
        
        //i know it bad to put it here but i put this here
        localStorage.setItem("game_state", "match")
      
        let newList = [];

        for (let i = 0; i < 5; i++){
            const random = Math.round(Math.random()*13);
            const newItem = {item: items[random], taken:false};
            newList.push(newItem);
        }

        localStorage.setItem("myItemList", JSON.stringify(newList));
        return newList;  
    }

    //*change later to be random per player in a room
    const [list, setList] = useState(()=>generateRandomList());

    


    return (
    <MatchContext.Provider value={{list, setList, myUID}}>
        <div className={styles.above}>
        
            <div className={styles.center}>
                <RedButton/>
                <BottomBar list={list} setList={setList}/>
            
            </div>

        </div>
    </MatchContext.Provider>
    )
}