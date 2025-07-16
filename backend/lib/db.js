import mongoose from "mongoose";

const connection = {};
const MONGOURI = `${process.env.MONGODB_URI}/${process.env.MONGO_DB}`

async function dbConnect(){

    if(connection.isConnected){
        console.log("Already connected to database")
        return;
    }
    try {
            
        const db = await mongoose.connect(MONGOURI || "");
        connection.isConnected = db.connections[0].readyState;
        console.log("db connected sucessfully",connection.isConnected)

    } catch (error) {
        console.log("db connection failed",error)
        process.exit(1);
    }
}
export default dbConnect