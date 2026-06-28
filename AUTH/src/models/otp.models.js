import mongoose from "mongoose";

const optSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "email is required"]
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "user is required"]
    },

    otpHash: {
        type: String,
        required: [true, "otp is required"]
    }
}, { timestamps: true })

const otpModel = mongoose.model("otp", optSchema)

export default otpModel;