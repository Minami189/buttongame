import styles from "./login.module.css";
import { useContext, useEffect, useState, useRef } from "react";
import { AppContext } from "../App";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import left from "../assets/left.png"
import right from "../assets/right.png"
export default function Login() {
  // change later to be an input
  
  const navigate = useNavigate();
  const [chosenAvatar, setChosenAvatar] = useState(0);
  const { setInstanceID, socket, avatars} = useContext(AppContext);
  const nameInput = useRef();

  useEffect(() => {
    socket.on("generate_token", (data) => {
      const token = data.instanceToken;
      localStorage.setItem("instanceToken", token);

      const decoded = jwtDecode(token);
      console.log("Decoded payload:", decoded);

      const generatedInstanceID = decoded.instanceID;
        
      // then setInstanceID globally
      setInstanceID(generatedInstanceID);
      generateList()
    });

    socket.on("render_list", (data)=>{
      setList(data.generatedList);
      console.log("rendered list: " + data.generatedList);
    })

    const instanceToken = localStorage.getItem("instanceToken")

    if (instanceToken !== null && instanceToken !== undefined && instanceToken !== "") {
      const decoded = jwtDecode(instanceToken);
      setChosenAvatar(decoded.avatar);
      nameInput.current.value = decoded.displayName;
    }

    return () => {
      socket.off("generate_token");
      socket.off("render_list");
    };

    
  }, []);

  function handleCreate() {
    const displayName = nameInput.current.value;
    if(displayName !== undefined && displayName!== null && displayName !== ""){
      localStorage.clear();
      socket.emit("login", { instanceDisplayName: displayName, avatar: chosenAvatar});
      navigate("/start");
    }else{
      alert("must input display name");
    }
    
  }

  function handleLeft(){
    if(chosenAvatar > 0){
      setChosenAvatar(prev => prev-1);
    }else{
      setChosenAvatar(avatars.length-1);
    }
  }

  function handleRight(){
    if(chosenAvatar < 5){
      setChosenAvatar(prev => prev+1);
    }else{
      setChosenAvatar(0);
    }
  }

  function generateList(){
        const token = localStorage.getItem("instanceToken");
        const decoded = jwtDecode(token);
        socket.emit("generate_list", {instanceID: decoded.instanceID});
        console.log("list being generated")
    }

  return (
    <div className={styles.loginWrapper}>

      <div className={styles.blur}> 

        <div className={styles.left}>
          <div className={styles.avatar}>
            <div className={styles.avatarDisplay}>
              <img src={left} className={styles.leftArrow} onClick={handleLeft}/>
              <img src={avatars[chosenAvatar]} className={styles.avatarImage}/>
              <img src={right} className={styles.rightArrow} onClick={handleRight}/>
            </div>
          </div>

          <button onClick={handleCreate}>
            Confirm
          </button>
        </div>


        <div className={styles.right}>
          <input className={styles.displayName} placeholder="Display Name" maxLength={30} ref={nameInput}/>
        </div>


      </div>
      
    </div>
  );
}
