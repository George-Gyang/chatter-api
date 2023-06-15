const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const User = require("./models/user");

const bcrypt = require("bcryptjs");

const app = express();
const salt = bcrypt.genSaltSync(10);

app.use(cors());
app.use(express.json());

// mongodb connection
mongoose.connect(
  "mongodb+srv://chatter:thUEvbnjj2VcVaEE@cluster0.kaymlzu.mongodb.net/?retryWrites=true&w=majority"
);

app.post("/register", async (req, res) => {
  const { email, firstName, lastName, password, confirmPassword } = req.body;
  try {
    const userInfor = await User.create({
      email,
      firstName,
      lastName,
      password: bcrypt.hashSync(password, salt),
      confirmPassword: bcrypt.hashSync(confirmPassword, salt),
    });
    res.json(userInfor);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

// app.post("/login", (req, res) => {
//   const { email, password } = req.body;
//   User.findOne(email);
// });

app.listen(4000);
