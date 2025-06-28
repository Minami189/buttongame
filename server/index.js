const express = require("express");
const http = require("http");
const {Server} = require("socket.io");

const app = express();
const server = http.createServer(app);
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const {nanoid} = require("nanoid");
//jwt initialization
dotenv.config();
const jwt_secret_key = process.env.JWT_KEY


let timer = 2;
const items = ["🎈","🎄","🧤","🧶","🎩","🏈","👟","🍕","🍔","🍟","🚑","👓","🎃","🎀"];



//keeping track of players and their lists
let players = [];

//keeping track of rooms and their hosts
let rooms = {};
let roomTimers = {};
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT"]
    }
});



function changeState(io, state, roomID){
    io.to(roomID).emit("change_state", {state: state});
    rooms[roomID].state = state;
}



//button press mechanic
io.on("connection", (socket)=>{
    console.log(`${socket.id} has connected`)

    socket.on("check_state", (data)=>{
        const roomID = data.roomID;
        let state;
        if(rooms[roomID]?.state !== undefined){
            state = rooms[roomID].state;
        }
        socket.emit("update_state", {state: state});
    })

    socket.on("button_press", (data)=>{
        socket.join(data.roomID);
        socket.to(data.roomID).emit("notify_press" ,{message: `${data.UID} pressed the button!`})

        if(roomTimers[data.roomID].currTime <= 0){
            roomTimers[data.roomID].interval.refresh();
            roomTimers[data.roomID].currTime = 2; 
            roomTimers[data.roomID].pause = false
            io.to(data.roomID).emit("timer_tick", {time: timer});

        }
    })

    socket.on("create_room", (data) => {
        

        //leave previous rooms first before autojoining
        socket.rooms.forEach((v)=>{
            if(v != socket.id){
                socket.leave(v);
                console.log("leaving room " + v);
            }
        })
        console.log(`creating room ${data.roomID} with host ${data.host}`)
        rooms[data.roomID]= {roomID:data.roomID, host: data.host, state: data.state};
        changeState(io, "lobby", data.roomID);
        
        socket.join(data.roomID);

        //create timer per room
        roomTimers[data.roomID] = {
            activeItems: [],
            pause: true,
            currTime: 2,
            interval: setInterval(()=>{
                if(roomTimers[data.roomID].currTime >= 1){
                    roomTimers[data.roomID].currTime--;
                    io.emit("timer_tick", {time: roomTimers[data.roomID].currTime})
                }

                else if(!roomTimers[data.roomID].pause){
                    let chosen = [];
                    let positionx = [];
                    let positiony = [];
                    roomTimers[data.roomID].pause = true;
                    for (let i = 0; i < 3; i++){
                        chosen.push(Math.round(Math.random() * 13));
                        positiony.push(Math.random());
                        positionx.push(Math.random());
                    }

                    //everytime the timer runs out reset the server to think all items are active
                    roomTimers[data.roomID].activeItems = chosen;

                    io.to(data.roomID).emit("populate_items", {chosenItems: chosen, positionx: positionx, positiony: positiony})
                }
            }, 1000)
        }

        
    });

// join_room: check from your list 
    socket.on("join_room", (data) => {
        const roomID = data.roomID;
        
        if (io.sockets.adapter.rooms.has(roomID)) {
            socket.join(roomID);
            socket.emit("attempt_join", { success: true, roomID });
            console.log("joined room " + roomID);
        } else {
            socket.emit("attempt_join", { success: false });
        }
    });

    //for messages in the lobby
    socket.on("send_message", (data)=>{
        socket.join(data.roomID);
        io.to(data.roomID).emit("update_messages", {content: data.content, senderName: data.name});
        console.log(`someone messaged at ${data.roomID} with contents ${data.content}`)
    })

    //emitted from start game button in lobby by host
    socket.on("start_game", (data)=>{
        const roomID = data.roomID;
        const instanceID = data.instanceID;
        roomTimers[roomID].pause = false;

        //join first
        socket.join(roomID);

        
  

        //get current room for reference
        const currentRoom = rooms[roomID];
        if(currentRoom){
            if(currentRoom.host == instanceID){
                //change the state of that index
                rooms[roomID].state="match";
                io.to(roomID).emit("begin_game");
            }else{
                console.log(data.instanceID + " you are not the host");
            } 
        }
              
    }) 

    //on user creating instnace
    socket.on("login",(data)=>{
        const displayName = data.instanceDisplayName || "Player 1";
        const instanceID = nanoid(20);
        const instanceToken = jwt.sign({displayName: displayName, instanceID: instanceID}, jwt_secret_key);

        socket.emit("generate_token", {instanceToken: instanceToken});
    })
    

    //on loading of the bottombar list
    socket.on("get_list", (data)=>{
        const instanceID = data.instanceID;

        console.log("your player: " + instanceID);
        players.forEach((v)=>{
            console.log(v.instanceID);
        })
        const player = players.find((player)=> player.instanceID == instanceID);
        
        let list;
        if(player){
            list = player.list;
        }

        socket.emit("refresh_list", {list: list})
    })

    //creating random list for each player  
    socket.on("generate_list", (data)=>{

        //for server side
        //this is the random ID generated for the user instance
        const instanceID = data.instanceID;
        let generatedList = []

        for(let i = 0; i < 5; i++){
            const rand = Math.round(Math.random()*13);
            generatedList = generatedList.concat({item: items[rand], taken: false});
        }

        if(players.length <= 0){
            players = players.concat({instanceID: instanceID, list: generatedList})
            console.log("added a player");
        }else{
            for(let i = 0; i < players.length; i++){
                if(players[i].instanceID == instanceID){
                    players[i].list = generatedList;
                    console.log("changed a player");
                    break;
                }else{
                    players = players.concat({instanceID: instanceID, list: generatedList})
                    console.log("added a player");
                }
            }
        }
        console.log(players);
        //for clientside rendering of this
        socket.emit("render_list", {generatedList: generatedList});
    })

    //*MUST BE CHANGED LATER WITH NEW SYSTEM
    socket.on("click_item", (data)=>{
        const claimedIndex = data.clickedindex;

        //UID of player who clicked
        const instanceID = data.instanceID;
        const clickedItem = data.clickedItem;

   
        let list;
        let playerIndex;
        for (let i = 0; i < players.length; i++){
            if(players[i].instanceID == instanceID){
                list = players[i].list;
                playerIndex = i;
            }
        }


        
        console.log(roomTimers[data.roomID].activeItems);
        
        if (claimedIndex >= 0 && claimedIndex < roomTimers[data.roomID].activeItems.length) {
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
                players[playerIndex].list[foundIndex].taken = true;
                roomTimers[data.roomID].activeItems.splice(claimedIndex, 1);
                console.log(list);
                io.emit("item_claimed", { claim_index: claimedIndex, instanceID:  instanceID, clickedItem: clickedItem, list: players[playerIndex].list});
            }
            

            const takenItems = players[playerIndex].list.filter((item)=>item.taken);
            console.log(takenItems);
            if(takenItems.length >= 5){
                rooms[data.roomID].state = "end";
                io.to(data.roomID).emit("game_end", {displayName: players[playerIndex].displayName});
            }   
            
        }

        console.log("claimed index: " + claimedIndex);
        console.log("active items: " + roomTimers[data.roomID].activeItems);
    })
})








io.listen(3000);