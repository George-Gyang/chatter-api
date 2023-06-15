const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const UserSchema = new Schema({ 
  email: { type: String, require: true, unique: true },
  firstName: { type: String, require: true, },
  lastName: { type: String, require: true },
  password: { type: String, require: true },
  confirmPassword: {
    type: String,
    require: true,
    validate: {
      validator: function(value){
        return value === this.password;
      }, message: 'password not  match'
    }
  },
});

const UserModel = model("User", UserSchema);

module.exports = UserModel;
