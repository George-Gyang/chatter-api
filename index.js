const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const User = require("./models/user");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs");
const cookieParser = require('cookie-parser')

const app = express();
const salt = bcrypt.genSaltSync(10);
const secret = "qwertyuiop454";

app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser())

// mongodb connection
mongoose.connect("mongodb+srv://chatter:thUEvbnjj2VcVaEE@cluster0.kaymlzu.mongodb.net/?retryWrites=true&w=majority");

// registration
app.post("/register", async (req, res) => {
  const { email, firstName, lastName, password, confirmPassword } = req.body;
  try {
    const userInfor = await User.create({
      email,
      firstName,
      lastName,
      password: bcrypt.hashSync(password, salt),
      confirmPassword: bcrypt.hashSync(password, salt),
    });
    res.json(userInfor);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

// login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userInfor = await User.findOne({email});
  // compare password with email
  const correct = bcrypt.compareSync(password, userInfor.password);
  if (correct) {
    // login
    jwt.sign({email, id:userInfor._id}, secret, {}, (err, token) =>{
       if(err) throw err;
       res.cookie('token', token).json("ok")
    })
  } else{
    res.status(400).json("wrong credentials");
  }
  res.json(userInfor)
});

// 
app.get('/profile', (req,res) =>{
  jwt.verify(token, secret, {}, (err, details) =>{
    if (err) throw err;
    res.json(details)
  })
})

app.listen(4000);
