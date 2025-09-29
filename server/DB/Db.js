import mongoose from "mongoose";

// Connect to MongoDB database

const connectDB = async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/lms`)
        console.log('Successfully connected')
    } catch (error) {
        console.log("Connection failed")
        throw(error)
    }
}

export default connectDB