import mongoose from "mongoose";
import {DB_NAME} from "../constant.js"

const connectDB = async () => {
    try {
        const connectionInstances = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n Mongodb connected !! DB HOST: 
        ${connectionInstances.connection.host}`)
    } catch (error) {
        console.log("Mongodb connection error", error)
        process.exit()
    }
}


export default connectDB;