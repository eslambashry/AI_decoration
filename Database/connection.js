import mongoose from "mongoose";

export const DB_connection = async()=>{
    return await mongoose.connect(process.env.MONGO_URL)
    .then((res)=>console.log("DataBase Connection Success 🔑"))  
    .catch((err)=>console.log("DataBase connection Fail 💩",err))
}