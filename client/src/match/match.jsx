
import styles from "./match.module.css";
import RedButton from "./red-button/red-button.jsx"
import BottomBar from "./bottombar/bottombar.jsx";
import { useState} from "react";


export default function Match(){
    const [list, setList] = useState(["🎈","🎄","🧤","🧶","🎩"]);

    return (
    <div className={styles.above}>
        
        <div className={styles.center}>
            <RedButton/>
            <BottomBar list={list} setList={setList}/>
        </div>

        
        
    </div>
    )
}