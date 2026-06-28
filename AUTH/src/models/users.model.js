import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "userName is required"],
        unique: [true, "username must be unique"]
    },

    email: {
        type: String,
        required: [true, "userName is required"],
        unique: [true, "username must be unique"]
    },

    password: {
        type: String,
        required: [true, "userName is required"],
    },
     
    verified:{
      type:Boolean,
      default:false
    }
})

const userModel=mongoose.model("user",userSchema)
export default userModel