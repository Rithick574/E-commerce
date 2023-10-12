const mongoose = require('mongoose');
const connection=require("../config/DBconnection")



const OTPschema= mongoose.Schema({
    username: String,
  number: String,
  email: String,
  password: String,
  otp: String,
  otpCreatedAt: Date
})
const OTP =mongoose.model("OTP",OTPschema);

module.exports=OTP;
