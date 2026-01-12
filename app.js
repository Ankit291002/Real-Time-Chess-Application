const express=require("express")
const socketIO = require("socket.io");
const http=require("http")
const {Chess}=require("chess.js")
const app=express()
const server=http.createServer(app)
const path=require("path")
const io = socketIO(server)
const chess=new Chess()
let player={}
let currentplayer="w"
app.set("view engine","ejs")
app.use(express.static(path.join(__dirname,"public")))
app.get("/",(req,res)=>{
    res.render("index")
})
io.on("connection",(uniquesocket)=>{
    if(!player.white){
        player.white=uniquesocket.id
        uniquesocket.emit("playerRole","w")
    }
    else if(!player.black){
        player.black=uniquesocket.id
        uniquesocket.emit("playerRole","b")
    }
    else{
        uniquesocket.emit("spectatorRole")
        
    }
    uniquesocket.on("disconnect",()=>{
        if(uniquesocket.id===player.white){
            delete player.white
        }
        else if(uniquesocket.id===player.black){
            delete player.black
        }
    })
    uniquesocket.on("move",(move)=>{
        try{
            if(chess.turn()==="w" && uniquesocket.id!==player.white) return
            if(chess.turn()==="b" && uniquesocket.id!==player.black) return
            const result=chess.move(move)
            if(result){
                currentplayer=chess.turn()
                io.emit("move",move)
                io.emit("boardState",chess.fen())
            }
            else{
                uniquesocket.emit("move",move)
            }
        }
        catch(err){
            uniquesocket.emit("invalidmove",move)
        }
    })
})


server.listen(3000)
