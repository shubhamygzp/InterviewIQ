const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: [true, "userName already taken"],
    required: true,
  },

  email: {
    type: String,
    unique: [true, "Account already exists with this email address"],
    required: true,
  },

  password: {
    type: String,
    required: true,
  },
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
