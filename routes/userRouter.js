const express=require("express");
const session = require("express-session");
const user=express.Router()
const passport=require("passport")
const bcrypt=require("bcrypt")
const userController = require('../controllers/userController')
require('../auth/passport');


//home page
user.get('/', userController.homePage);

//guest user
user.get('/guestuser',userController.guestPage)

//login
user.get('/login',userController.login)
user.post('/login',userController.logged)

//passport
user.get("/auth/google",passport.authenticate('google',{scope:["profile","email"]}));
user.get("/auth/google/done", passport.authenticate('google',{ failureRedirect: '/login'}),userController.passport)


//signup with OTP
user.get('/signup',userController.signup)
user.post('/sentotp',userController.sentOtp)
user.post('/verifyOTP',userController.verifyOTP)

//forgot password
user.get('/forgotpassword',userController.forgotPassword)
user.post('/forgotpassword',userController.sentforgotOTP)
user.post('/verifyforgotOTP',userController.verifygorgotOTP)
user.post('/resetpassword',userController.resetpassword)

//otp signup
user.post("/otp",userController.signup)

//view product
user.get('/product/:productId',userController.viewProduct)

//view guest 
user.get('/product/guest/:productId',userController.viewProductGuest)

//shop,cart,wishlist
user.get('/shop',userController.ShopProduct)
user.get('/wishlist',userController.wishList)
user.get('/guest/shop',userController.ShopProductGuest)


//logout
user.get("/logout",userController.logOut)



module.exports = user;    