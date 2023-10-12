const passport=require("passport")
const Users = require("../model/userSchema");
require("dotenv").config();
// google=require('./google')

// Ensure the path to the 'google' module is correct
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser((user,done)=>{
    done(null,user.id);
})
passport.deserializeUser((user,done)=>{
    done(null,user);
})


passport.use("google",
        new GoogleStrategy(
          {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "http://localhost:8080/auth/google/done",
                scope: ["profile","email"],
          },
          async function (request, accessToken, refreshToken, profile, done) {
              done(null, profile);
          }

));



