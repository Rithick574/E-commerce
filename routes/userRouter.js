const express=require("express");
const session = require("express-session");
const user=express.Router()
const passport=require("passport")
const bcrypt=require("bcrypt")
const userController = require('../controllers/userController')
require('../auth/passport');
const userAuth=require('../middleware/userAuth')
const productController=require('../controllers/product')
const cartController=require('../controllers/cartController')
const orderController=require('../controllers/orderController')
const wishlistController=require('../controllers/wishlistController')
const calculateCartCount = require('../middleware/cartCountMiddleware');



//home page
user.get('/',userAuth.verifyUser,calculateCartCount,userController.homePage);

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
user.get('/resendotp',userAuth.userExist,userController.resendOTP)


//forgot password
user.get('/forgotpassword',userAuth.userExist,userController.forgotPassword)
user.post('/forgotpassword',userAuth.userExist,userController.sentforgotOTP)
user.post('/verifyforgotOTP',userAuth.userExist,userController.verifygorgotOTP)
user.post('/resetpassword',userAuth.userExist,userController.resetpassword)


//view product
user.get('/product/:productId',userAuth.verifyUser,productController.viewProduct)

//view guest 
user.get('/product/guest/:productId',userAuth.userExist,productController.viewProductGuest)

//shop,cart
user.get('/shop',userAuth.verifyUser,productController.ShopProduct)

//wishlist
user.get('/wishlist',userAuth.verifyUser,wishlistController.wishList)
user.post('/wishlist',userAuth.verifyUser,wishlistController.addtoWishList)
user.post('/wishlistdelete/',userAuth.verifyUser,wishlistController.deletefromWishlist)

//guest shop
user.get('/guest/shop',userAuth.userExist,productController.ShopProductGuest)


//cart
user.post("/addtocart/:productId",userAuth.verifyUser,cartController.addToCart)
user.get('/cart',userAuth.verifyUser,cartController.viewCart)
user.post('/updatequantity',userAuth.verifyUser,cartController.updateQuantity)
user.post('/removefromcart',userAuth.verifyUser,cartController.removeFromCart)
user.get('/getcartquantity',userAuth.verifyUser,cartController.getQuantity)


//place order
user.get('/placeorder',userAuth.verifyUser,orderController.PlaceOrder)
user.post('/addAddress-Checkout',userAuth.verifyUser,orderController.addAddress)
user.post('/placeOrder',userAuth.verifyUser,orderController.postCheckout)
user.get('/trackOrder',userAuth.verifyUser,orderController.orderHistory)


//profile
user.get('/profile',userAuth.verifyUser,userController.userProfile)
user.get('/viewproduct/:orderId',userAuth.verifyUser,userController.vieworderedProduct)
user.get('/cancelorder/:orderId',userAuth.verifyUser,userController.cancelOrder)
user.get('/address',userAuth.verifyUser,userController.address)
user.post('/addaddressProfile',userAuth.verifyUser,userController.addaddressProfile)
user.delete('/deleteAddress/:addressId',userAuth.verifyUser,userController.deleteAddress)
user.post('/updateProfile',userAuth.verifyUser,userController.updateProfile)
user.get('/accountSettings',userAuth.verifyUser,userController.accountSettings)

//logout
user.get("/logout",userController.logOut)

user.get('/checkout',(req,res)=>{
    res.render('user/checkout')
})



module.exports = user;    