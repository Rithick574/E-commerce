require('dotenv').config();
const express = require('express');
const Twilio = require('twilio');
const auth = express.Router();
const User = require('../model/UserOTPVerification');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const {signup} = require('../controllers/userController')

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.VERIFY_SID;



 const client = require('twilio') (accountSid, authToken, { 
  lazyLoading: true
})

const sentOTP = async (phone, res) => {
  console.log(phone);
  try {
    const otpResponse = await client.verify.v2
      .services(verifySid)
      .verifications.create({
        to: `+91${phone}`,
        channel: "sms",
      });
      console.log("otp sented successfully");
      return { success: true ,phone};
  }catch (error) {
    if (error) {
      // Check if the error object is defined
      console.error("OTP sending failed:", error);
      return { success: false, error: error.message };
    } 
  }
};

module.exports = {
  sentOTP,
};

