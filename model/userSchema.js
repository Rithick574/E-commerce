const mongoose = require("mongoose");
require("../config/DBconnection");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  timeStamp: { type: Date },
  profilePhoto: { type: String },
  phone: {
    type: String,
    // required: true
  },
  password: {
    type: String,
    //  required:true
  },
  Status: {
    type: String,
    default: "Active",
  },
  referralLink: {
    type: String,
    unique: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  wallet: {
    type: Number,
    default: 0
  },
  referredUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
  ],
  Address: [
    {
      Name: { type: String },
      AddressLane: { type: String },
      City: { type: String },
      Pincode: { type: Number },
      State: { type: String },
      Mobile: { type: Number },
    },
  ],
});

UserSchema.statics.getUsers = async function () {
  try {
    const users = await this.find();
    return users;
  } catch (error) {
    throw error;
  }
};

const users = mongoose.model("users", UserSchema);

module.exports = users;
