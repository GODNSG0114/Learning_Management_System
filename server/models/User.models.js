import express from 'express'
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        _id :{
            type : String ,
            required:true
        },
        name :{
            type : String ,
            required:true
        },
        email :{
            type : String ,
            required:ture
        },
        imageUrl :{
            type : String ,
            required:ture
        },
        enrolledCourses:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:'Course'
            }
        ]
    
    },{timestamps:true}
)

export default User = mongoose.model('User' ,UserSchema);