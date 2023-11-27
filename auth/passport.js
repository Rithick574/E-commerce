const passport=require("passport")
const Users = require("../model/userSchema");
require("dotenv").config();


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
                callbackURL: "https://phonebazaar.shop/auth/google/done",
                scope: ["profile","email"],
          },
          async function (request, accessToken, refreshToken, profile, done) {
            try {
                const email=profile.emails[0].value
                const existingUser = await Users.findOne({ email: email });

                if (existingUser) {
                    return done(null, existingUser);
                }
              

                done(null,profile)  
                
            } catch (error) {
                console.log(error);
                return done(error);
            }
          }

));



