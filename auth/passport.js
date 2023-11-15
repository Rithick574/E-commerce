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
                callbackURL: "http://localhost:8080/auth/google/done",
                scope: ["profile","email"],
          },
          async function (request, accessToken, refreshToken, profile, done) {
            try {
                const email=profile.emails[0].value
                const exist= await Users.findOne({email:email});
               
                if(exist){
                
                    return done(null,false,"duplicate email");
                }
              

                done(null,profile)  
                
            } catch (error) {
                console.log(err);
            }
          }

));



