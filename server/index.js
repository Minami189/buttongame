const express = require("express");
const http = require("http");
const {Server} = require("socket.io");

const app = express();
const server = http.createServer(app);
let timer = 2;
const items = ["🎈","🎄","🧤","🧶","🎩","🏈","👟","🍕","🍔","🍟","🚑","👓","🎃","🎀"];
let pause = false;
let activeItems = []

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT"]
    }
});



//Global timer
const interval = setInterval(()=>{
    if(timer <= 10 && timer >= 1){
        timer--;
        io.emit("timer_tick", {time: timer})
    }

//global item randomization 

    else if(!pause){
        let chosen = [];
        let positionx = [];
        let positiony = [];
        pause = true; 
        for (let i = 0; i < 3; i++){
            chosen.push(Math.round(Math.random() * 13));
            positiony.push(Math.random());
            positionx.push(Math.random());
        }

        //everytime the timer runs out reset the server to think all items are active
        activeItems = chosen;

        console.log(`chosen items ${chosen}`);
        io.emit("populate_items", {chosenItems: chosen, positionx: positionx, positiony: positiony})
    }
    
}, 1000);



//button press mechanic
io.on("connection", (socket)=>{

    socket.on("button_press", (data)=>{
        //*change later to socket.to.emit for rooms
        socket.broadcast.emit("notify_press" ,{message: `${data.UID} pressed the button!`})
        if(timer <= 0){
            interval.refresh();
            timer = 2; 
            io.emit("timer_tick", {time: timer});
            pause = false
        }
    })
    
    socket.on("click_item", (data)=>{
        const claimedIndex = data.clickedindex;

        //UID of player who clicked
        const playerUID = data.myUID;
        const clickedItem = data.clickedItem;
        let list = data.list
        

        
        console.log(activeItems);


        
        if (claimedIndex >= 0 && claimedIndex < activeItems.length) {
            //reset everytime to -1 cuz we are checking 
            let foundIndex = -1;

            //look for the first matching item and put its index
            for(let i = 0; i < list.length; i++){
                //if the item's slots in the list are all taken then cant take
                if(list[i].item == clickedItem && list[i].taken == false){
                    foundIndex = i;
                    break;
                }
            }


            //this will technically make the item taken true for everyone
            //but in the client we will check for the player UID of who clicked
            if(foundIndex >= 0){
                list[foundIndex].taken = true;
                activeItems.splice(claimedIndex, 1);
                io.emit("item_claimed", { claim_index: claimedIndex, playerUID:  playerUID, clickedItem: clickedItem, list: list});
            }
            

            const takenItems = list.filter((v)=> v.taken)
            if(takenItems.length >= 5){
                io.emit("game_end", {winnerUID: playerUID});
            }
            
        }

        console.log("claimed index: " + claimedIndex);
        console.log("active items: " + activeItems);
    })
})








io.listen(3000);