const mongoose = require("mongoose");
require("../config/DBconnection");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  Status: {
    type: String,
    default: "Active",
  },
});

const Admin = mongoose.model('Admin',adminSchema)

module.exports = Admin;
