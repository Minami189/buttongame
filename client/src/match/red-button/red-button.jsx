import styles from './red-button.module.css';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Item from "../../item/item.jsx";
import { useContext } from "react";
import { AppContext } from "../../App.jsx";
import { jwtDecode } from 'jwt-decode';
import button from "../../assets/button.mp3";

export default function RedButton() {
  const { socket, winner, setWinner, avatars } = useContext(AppContext);
  const [selected, setSelected] = useState([]);
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState();
  const [avatar, setAvatar] = useState();
  const [disable, setDisable] = useState(false);
  const [animating, setAnimating] = useState(false);


  const navigate = useNavigate();

  function buttonClick() {
    if (!disable) {
      // Block further clicks immediately
      const token = localStorage.getItem("instanceToken");
      const decoded = jwtDecode(token);
      const displayName = decoded.displayName;
      const avatar = decoded.avatar;
      const instanceID = decoded.instanceID;

      socket.emit("button_press", {
        displayName,
        roomID: localStorage.getItem("roomID"),
        avatar,
        instanceID
      });
    }
  }

  // Show a "press accepted" animation
  function notifySuccess(message, avatar) {
    const buttonAudio = new Audio(button);
    buttonAudio.volume = 1;
    buttonAudio.play();
    
    setMessage(message);
    setAvatar(avatar);
    setActive(true);
    setSelected([]);

    setAnimating(false);

    setTimeout(() => {
        setAnimating(true);
    }, 10);

    // Allow clicking again after animation
    setTimeout(() => {
      setActive(false);
      setDisable(false);
    }, 2000);
  }

  // Show a "press denied" message, no animation
  function notifyDenial(message, avatar) {
    setMessage(message);
    setAvatar(avatar);
    setAnimating(false);

    setTimeout(() => {
        setAnimating(true);
    }, 10);
    
  }

  useEffect(() => {
    socket.emit("get_time", { roomID: localStorage.getItem("roomID") });

    socket.on("notify_press", (data) => {
      notifySuccess(data.message, data.avatar);
    });

    socket.on("notify_denial", (data) => {
      notifyDenial(data.message, data.avatar);
    });

    socket.on("timer_tick", (data) => {
      setTimer(data.time);
    });

    socket.on("game_end", (data) => {
      console.log("game ended with " + data.avatar + data.displayName);
      setWinner({ avatar: data.avatar, displayName: data.displayName });
      navigate("/end");
    });

    socket.on("timeout", ()=>{
        notifySuccess("button lost patience", 6)
    })

    return () => {
      socket.off("notify_press");
      socket.off("notify_denial");
      socket.off("timer_tick");
      socket.off("game_end");
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.buttonWrapper}
        onClick={buttonClick}
        style={{ cursor: disable ? "not-allowed" : "pointer" }}>

        <div className={animating ? styles.visible : styles.invisible}>
          <img src={avatars[avatar]} />
          {message}
        </div>
        <div className={active ? styles.active : styles.buttonHead} />
        <div className={styles.buttonBase}>
          <h1>{timer}</h1>
        </div>
      </div>

      <div className={styles.showing}>
        <Item selected={selected} setSelected={setSelected} />
      </div>
    </div>
  );
}
