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
app.use("/uploads", express.static(__dirname + "/uploads"));

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
      author: info.id,
    });
    // res.json({ files: req.file });
    res.json(postInfor);
  });
});

// fetch post
app.get("/post", async (req, res) => {
  const posts = await Post.find()
    .populate("author", ["lastName"])
    .sort({ createdAt: -1 })
    .limit(10);
  res.json(posts);
});

// fetch single post
app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const postInfor = await Post.findById(id).populate("author", ["lastName"]);
  res.json(postInfor);
});


// Updating post
app.put("/post", uploadMiddleware.single("file"), async (req, res) => {
  let newFilePath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    newFilePath = path + "." + ext;
    fs.renameSync(path, newFilePath);
  }
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { id, title, summary, comment } = req.body;
    const postInfor = await Post.findById(id);
    const postAuthor =
      JSON.stringify(postInfor.author) === JSON.stringify(info.id);
    if (!postAuthor) {
      return res.status(400).json("invalid author!!");
    }
    await postInfor.updateOne({
      title,
      summary,
      comment,
      file: newFilePath ? newFilePath : postInfor.file,
    });
    // res.json(postAuthor)
    // const postInfor = await Post.create({
    //   title,
    //   summary,

    //   comment,
    //   file: newFilePath,
    //   author:info.id,
    // });
    // res.json({ files: req.file });
    res.json(postInfor)
  });
});

// app.delete("/post/:id", (req, res) =>{
//   const {id} = req.params;
//   const deleteInfor = Post.findByIdAndDelete(id, (err, user) => {
//     if (err) {
//       res.status(500).send(err);
//     } else {
//       res.status(200).send(user);
//     }
//   });
//   res.json(deleteInfor)
// })


// app.delete("/post/:id", async (req, res) => {
//   const {id} = req.params;
//   const deleteInfor = await Post.findByIdAndDelete(id);

//   if (deleteInfor) {
//     res.status(200);
//   } else {
//     res.status(500).send("An error occurred while deleting the post.");
//   }
// });

app.delete("/post/:id", async (req, res) => {
  const {id} = req.params;
  const deleteInfor = await Post.findByIdAndDelete(id);

  if (deleteInfor) {
    res.status(200).json({
      success: true,
      message: "Post deleted successfully.",
    });
  } else if (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } else {
    res.status(500).json({
      success: false,
      message: "An unknown error occurred.",
    });
  }
});

app.listen(4000);
