import { connect } from "mongoose";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import userModel from "./src/models/users.model.js";

connectDB()

app.get('/user', async(req, res) => {
    const user = await userModel.find()
    res.json(user)
})

app.listen(3000, () => {
    console.log("server is running on 3000");
})

