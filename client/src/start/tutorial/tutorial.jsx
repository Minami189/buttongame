import styles from "./tutorial.module.css";
import logo from "../../assets/logo.png"
import botAvatar from "../../assets/botAvatar.png"

export default function Tutorial({showTutorial, setShowTutorial}){
    if(showTutorial){
        return(
        <div className={styles.tutorialWrapper} onClick={()=>setShowTutorial(false)}>
            <div className={styles.tutorialBody}>
                <img src={logo} style={{width: "15%"}}/>

                <div className={styles.section}>
                    <div className={styles.header}>
                        <img src={botAvatar} style={{width:"5%", height:"5%"}}/> 
                        <h1 className={styles.sectionText}>The Button</h1>
                    </div>
                    <div className={styles.content}>
                        <ul>
                            <li>Once the game starts, the red button has a 10-second countdown timer.</li>
                            <li>Every time the timer reaches 0, it spawns 5 random emojis on the screen.</li>
                            <li>Clicking the button does two things: 
                                <ol>
                                    <li>Removes all emojis currently on the screen.</li>
                                    <li>Adds a random emoji from your personal collection list to the spawn pool (it will appear in the cycle after the next).</li>
                                </ol>                                
                            </li>
                        </ul>
                        <p><b>⚠️ Important:</b> After you click the button, you cannot click it again during the next cycle. You’ll need to wait one full countdown before you can use it again.</p>
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.header}>
                        <h1>👥</h1>
                        <h1 className={styles.sectionText}>Players</h1>
                    </div>
                    <div className={styles.content}>
                        <ul>
                            <li>Each player has a list of 5 target emojis displayed at the bottom of their screen.</li>
                            <li>The objective is to collect all 5 of your emojis before anyone else.</li>
                            <li>When an emoji spawns, you can collect it if it’s on your list.</li>
                            <li>The first player to complete their collection wins the game.</li>
                                
                        </ul>
                        
                    </div>
                </div>
                
            </div>
        </div>
        )
    }
    
}