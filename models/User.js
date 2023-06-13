const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const userSchema = new Schema({
  firstName: { type: String, require: true },
  lastName: { type: String, require: true },
  email: { type: String, require: true },
  password: { type: String, require: true },
  confirmPassword: { type: String, require: true },
});

const UserModel = model('User', userSchema);

module.exports = UserModel;