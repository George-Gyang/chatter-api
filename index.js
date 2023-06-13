const express = require("express");
const cors = require('cors')
const mongoose = require("mongoose")

const User = require('./models/User');

const app = express();

app.use(cors());
app.use(express.json())

// mongodb connection
mongoose.connect('mongodb+srv://chatter:thUEvbnjj2VcVaEE@cluster0.kaymlzu.mongodb.net/?retryWrites=true&w=majority')


app.post("/register", async (req, res) => {
    const {firsName, lastName, email, password, confirmPassword} = req.body;
    const UserInfor = await User.create({firsName, lastName, email, password, confirmPassword})
  res.json(UserInfor);
});

app.listen(4000);


// thUEvbnjj2VcVaEE