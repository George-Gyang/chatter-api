const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const User = require("./models/user");
const Post = require("./models/post");
const bcrypt = require("bcryptjs");

const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const uploadMiddleware = multer({ dest: "uploads/" });
const fs = require("fs");

const salt = bcrypt.genSaltSync(10);
const secret = "qwertyuiop454kdsjbfabnhfiUHRIU";

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"))

// mongodb connection
mongoose.connect(
  "mongodb+srv://chatter:thUEvbnjj2VcVaEE@cluster0.kaymlzu.mongodb.net/?retryWrites=true&w=majority"
);

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
  const userInfor = await User.findOne({ email });
  // compare password with email
  const correct = bcrypt.compareSync(password, userInfor.password);
  if (correct) {
    // login
    jwt.sign({ email, id: userInfor._id }, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie("token", token).json({
        id: userInfor._id,
        email,
      });
    });
  } else {
    res.status(400).json("wrong credentials");
  }
});

// profile Token
app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) throw err;
    res.json(info);
  });
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("ok");
});

// create post
app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  const { originalname, path } = req.file;
  const parts = originalname.split(".");
  const ext = parts[parts.length - 1];
  const newFilePath = path + "." + ext;
  fs.renameSync(path, newFilePath);

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { title, summary, comment } = req.body;
    const postInfor = await Post.create({
      title,
      summary,
      comment,
      file: newFilePath,
      author:info.id,
    });
    // res.json({ files: req.file });
    res.json(postInfor);
  });
  });
  

// fetch post
app.get("/post", async (req, res) =>{
  const posts = await Post.find()
  .populate('author', ["lastName"]).sort({createdAt: -1}).limit(10);
  res.json(posts);
})

// fetch single post
app.get("/post/:id", async (req, res) =>{
  const {id} = req.params;
  const postInfor = await Post.findById(id).populate("author", ["lastName"]);
  res.json(postInfor)
})

app.listen(4000);
