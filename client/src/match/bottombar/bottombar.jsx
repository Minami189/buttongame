import styles from './bottombar.module.css'


export default function BottomBar({list, setList}){
    //change later to be dynamic to whatever the player needs

    return(
        <div className={styles.bar}>
            {
                list.map((v)=>{
                    return(<div className={styles.itemList}>{v}</div>)
                })
            }
        </div>
    )
}