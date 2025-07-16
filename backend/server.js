import express from 'express'
import "dotenv/config"
import cors from "cors"
import http from "http"
import dbConnect from './lib/db.js'

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5000

// middleware setup

app.use(express.json({limit:"4mb"}))
app.use(cors())
await dbConnect()

app.use("/api/status",(req,res)=> res.send("Server is live"))


server.listen(PORT,()=>{
    console.log("Server is running on port "+PORT)
})