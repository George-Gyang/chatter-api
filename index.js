const express = require("express");
const cors = require('cors')
const mongoose = require("mongoose")

const User = require('./models/user')

const bcrypt = require('bcryptjs');

const app = express();
const salt = bcrypt.genSaltSync(10);

app.use(cors());
app.use(express.json())

// mongodb connection
mongoose.connect('mongodb+srv://chatter:thUEvbnjj2VcVaEE@cluster0.kaymlzu.mongodb.net/?retryWrites=true&w=majority')


app.post("/register", async (req, res) => {
    const {firstName, lastName, email, password, confirmPassword} = req.body;
    try{
      const userInfor = await User.create({firstName, lastName, email, password, confirmPassword})
    res.json(userInfor);
    } catch(e){
      res.status(400).json(e)
    }
});

app.listen(4000);
