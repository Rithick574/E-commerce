const express=require("express");
const session = require("express-session");
const user=express.Router()
const passport=require("passport")
const bcrypt=require("bcrypt")
const userController = require('../controllers/userController')
require('../auth/passport');
const userAuth=require('../middleware/userAuth')
const productController=require('../controllers/product')


//home page
user.get('/',userAuth.verifyUser,userController.homePage);

//guest user
user.get('/guestuser',userAuth.userExist,userController.guestPage)

//login
user.get('/login',userAuth.userExist,userController.login)
user.post('/login',userAuth.userExist,userController.logged)

//passport
user.get("/auth/google",passport.authenticate('google',{scope:["profile","email"]}));
user.get("/auth/google/done", passport.authenticate('google',{ failureRedirect: '/login'}),userController.passport)



//signup with OTP
user.get('/signup',userAuth.userExist,userController.signup)
user.post('/sentotp',userAuth.userExist,userController.sentOtp)
user.post('/verifyOTP',userAuth.userExist,userController.verifyOTP)


//forgot password
user.get('/forgotpassword',userAuth.userExist,userController.forgotPassword)
user.post('/forgotpassword',userAuth.userExist,userController.sentforgotOTP)
user.post('/verifyforgotOTP',userAuth.userExist,userController.verifygorgotOTP)
user.post('/resetpassword',userAuth.userExist,userController.resetpassword)


//view product
user.get('/product/:productId',userAuth.verifyUser,productController.viewProduct)

//view guest 
user.get('/product/guest/:productId',userAuth.userExist,productController.viewProductGuest)

//shop,cart,wishlist
user.get('/shop',userAuth.verifyUser,productController.ShopProduct)
user.get('/wishlist',userAuth.verifyUser,productController.wishList)

//guest shop
user.get('/guest/shop',userAuth.userExist,productController.ShopProductGuest)


//cart
user.get("/addtocart",userAuth.verifyUser,productController.addToCart)


//logout
user.get("/logout",userController.logOut)



module.exports = user;    