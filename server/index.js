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

    socket.on("restart_game", (data)=>{
        const roomID = data.roomID;
        const instanceID = data.instanceID;
        if(rooms[roomID].host == instanceID){
            if(roomID !== undefined || roomID !== "" || roomID !== null){
                rooms[roomID].state = "lobby";
                const state = rooms[roomID].state;
                io.to(roomID).emit("update_state", {state: state});
            }
        }else{
            socket.emit("not_host");
        }
    })

    socket.on("get_time", (data)=>{

        if(roomTimers[data.roomID] !== undefined){
            socket.emit("timer_tick", {time: roomTimers[data.roomID].currTime});
        }
        
    })

    socket.on("check_state", (data)=>{
        const roomID = data.roomID;
        
        if(rooms[roomID] != undefined){
            const state = rooms[roomID].state;
            socket.emit("update_state", {state: state});
        }
        
    })

    socket.on("button_press", (data)=>{
        socket.join(data.roomID);
        socket.to(data.roomID).emit("notify_press" ,{message: `${data.displayName} pressed the button!`, avatar: data.avatar})

        if(roomTimers[data.roomID] !== undefined){
            if(roomTimers[data.roomID].currTime <= 0){
                roomTimers[data.roomID].interval.refresh();
                roomTimers[data.roomID].currTime = process.env.TIMER_BEGIN; 
                roomTimers[data.roomID].pause = false
                io.to(data.roomID).emit("timer_tick", {time: roomTimers[data.roomID].currTime});
                
                roomTimers[data.roomID].activeItems = [];
            }
        }
        
    })

    socket.on("create_room", (data) => {
        

        //leave previous rooms first before autojoining
        socket.rooms.forEach((v)=>{
            if(v != socket.id){
                socket.leave(v);
            }
        })
        rooms[data.roomID]= {roomID:data.roomID, host: data.host, state: data.state, players:[data.host]};
        changeState(io, "lobby", data.roomID);
        
        socket.join(data.roomID);

        //create timer per room
        roomTimers[data.roomID] = {
            activeItems: [],
            pause: true,
            currTime: 10,
            interval: setInterval(()=>{
                if(roomTimers[data.roomID].currTime >= 1){
                    roomTimers[data.roomID].currTime--;
                    io.to(data.roomID).emit("timer_tick", {time: roomTimers[data.roomID].currTime})
                }

                else if(!roomTimers[data.roomID].pause){
                    let newItems = [];
                    roomTimers[data.roomID].pause = true;

                    for (let i = 0; i < 5; i++){
                        let chosen = Math.round(Math.random() * 13);
                        let positiony =Math.random();
                        let positionx = Math.random();

                        newItems.push(
                            {
                                chosen: chosen,
                                positiony: positiony,
                                positionx: positionx
                            }
                        );

                    }

                    roomTimers[data.roomID].activeItems = newItems;
                    io.to(data.roomID).emit("populate_items", {activeItems: roomTimers[data.roomID].activeItems})
                }
            }, 1000)
        }

        
    });

// join_room: check from your list 
    socket.on("join_room", (data) => {
        const roomID = data.roomID;
        const instanceID = data.instanceID;
        if (io.sockets.adapter.rooms.has(roomID)) {
            socket.join(roomID);
            rooms[roomID].players.push(instanceID);
            socket.emit("attempt_join", { success: true, roomID });
        } else {
            socket.emit("attempt_join", { success: false });
        }
    });

    //for messages in the lobby
    socket.on("send_message", (data)=>{
        socket.join(data.roomID);
        io.to(data.roomID).emit("update_messages", {content: data.content, senderName: data.name, avatar: data.avatar});
    })

    //emitted from start game button in lobby by host
    socket.on("start_game", (data)=>{
        const roomID = data.roomID;
        const instanceID = data.instanceID;
        roomTimers[roomID].pause = false;
        roomTimers[roomID].currTime = process.env.TIMER_BEGIN;
        //join first
        socket.join(roomID);  

        //get current room for reference
        const currentRoom = rooms[roomID];
        if(currentRoom){
            if(currentRoom.host == instanceID){
                //change the state of that index
                rooms[roomID].state="match";
                io.to(roomID).emit("begin_game");
                io.to(roomID).emit("update_state", {state: rooms[roomID].state});
            }
        }

        
    }) 

    //on user creating instnace
    socket.on("login",(data)=>{
        const displayName = data.instanceDisplayName || "Player 1";
        const avatar = data.avatar;
        const instanceID = nanoid(20);
        const instanceToken = jwt.sign({displayName: displayName, instanceID: instanceID, avatar: avatar}, jwt_secret_key);
        players = players.concat({displayName: displayName, instanceID: instanceID, avatar:avatar});
        socket.emit("generate_token", {instanceToken: instanceToken});
        console.log(players);
    })
    

    //on loading of the bottombar list
    socket.on("get_list", (data)=>{
        const instanceID = data.instanceID;
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
            players = players.concat({instanceID: instanceID, list: generatedList, avatar:avatar, displayName:displayName})

        }else{
            for(let i = 0; i < players.length; i++){
                if(players[i].instanceID == instanceID){
                    players[i].list = generatedList;
                    break;
                }
            }
        }

        //for clientside rendering of this
        console.log(players);
        socket.emit("render_list", {generatedList: generatedList});
    })

    socket.on("get_items", (data)=>{
        if(roomTimers[data.roomID] !== undefined){
            socket.emit("render_items", {activeItems: roomTimers[data.roomID].activeItems});
        }

    })

    socket.on("click_item", (data)=>{
        const claimedIndex = data.clickedindex;

        //UID of player who clicked
        const instanceID = data.instanceID;
        const clickedItem = data.clickedItem;
        let displayName;
        for(let i = 0; i < players.length; i++){
            if(players[i].instanceID == instanceID){
                displayName = players[i].displayName;
                break;
            }
        }
        
   
        let list;
        let playerIndex;
        for (let i = 0; i < players.length; i++){
            if(players[i].instanceID == instanceID){
                list = players[i].list;
                playerIndex = i;
            }
        }
        
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
                io.to(data.roomID).emit("item_claimed", { 
                    claim_index: claimedIndex, instanceID:  instanceID, clickedItem: clickedItem, list: players[playerIndex].list, displayName: displayName,
                    posx: data.posx, posy:data.posy, avatar: data.avatar
                });
            }
            

            const takenItems = players[playerIndex].list.filter((item)=>item.taken);
            console.log(takenItems);
            console.log(playerIndex)
            console.log("clicker : " + players[playerIndex].displayName);
            if(takenItems.length >= 5 && rooms[data.roomID] !== undefined){
                rooms[data.roomID].state = "end";
                io.to(data.roomID).emit("game_end", {displayName: players[playerIndex].displayName, avatar: players[playerIndex].avatar});
                io.to(data.roomID).emit("update_state", {state: rooms[data.roomID].state});
            }   
            
        }
    })
})








io.listen(3000);