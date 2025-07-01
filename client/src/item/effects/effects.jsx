import styles from "./effects.module.css";
import {useContext, useEffect } from "react";
import { AppContext } from "../../App";
import { jwtDecode } from "jwt-decode";
import claim from "../../assets/claim.mp3"

export default function Effects({posx, posy, name, avatar}){
    const {avatars} = useContext(AppContext);
   
    const top = ( posy * ((window.innerHeight * 0.8) - 250)) + "px";
    const left = ( posx * (window.innerWidth - 250)) + "px";

    useEffect(() => {
    const audio = new Audio(claim);
    audio.volume = 0.6;
    audio.play();
    }, []);
    return(

            
        <div className={styles.effectWrapper} style={{top: top, left: left}}>
            
            claimed by <img src={avatars[avatar]}/><b>{name}</b>
        </div>

            
    )
}