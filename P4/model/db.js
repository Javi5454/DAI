import mongoose from "mongoose";

const USER_DB = process.env.USER_DB;
const PASS = process.env.PASS;
const url = `mongodb://${USER_DB}:${PASS}@localhost:27017/VibraModa?authSource=admin`;

export default function connectDB(){
    try{
        mongoose.connect(url);
    }catch(err){
        console.error(err.message);
        process.exit(1); //Salimos con el código de error 1
    }

    const dbConnection = mongoose.connection;
    dbConnection.once("open", (_) => {
        console.log(`Database connected: ${url}`);
    });

    dbConnection.on("error", (err) => {
        console.error(`connection error: ${err}`);
    });

    return;
}