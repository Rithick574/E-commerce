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
user.get("/auth/google/done",calculateCartCount,passport.authenticate('google',{ failureRedirect: '/login'}),userController.passport)



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
user.get('/product/:productId',userAuth.verifyUser,calculateCartCount,productController.viewProduct)

//view guest 
user.get('/product/guest/:productId',userAuth.userExist,productController.viewProductGuest)

//shop,cart
user.get('/shop',userAuth.verifyUser,calculateCartCount,productController.ShopProduct)

//wishlist
user.get('/wishlist',userAuth.verifyUser,calculateCartCount,wishlistController.wishList)
user.post('/wishlist',userAuth.verifyUser,calculateCartCount,wishlistController.addtoWishList)
user.post('/wishlistdelete/',userAuth.verifyUser,calculateCartCount,wishlistController.deletefromWishlist)

//guest shop
// user.get('/guest/shop',productController.ShopProductGuest)


//cart
user.post("/addtocart/:productId",userAuth.verifyUser,calculateCartCount,cartController.addToCart)
user.get('/getproduct/:productId',userAuth.verifyUser,calculateCartCount,cartController.stockcheck)
user.get('/cart',userAuth.verifyUser,calculateCartCount,cartController.viewCart)
user.post('/updatequantity',userAuth.verifyUser,calculateCartCount,cartController.updateQuantity)
user.post('/removefromcart',userAuth.verifyUser,calculateCartCount,cartController.removeFromCart)
// user.get('/getcartquantity',userAuth.verifyUser,cartController.getQuantity)


//place order
user.get('/placeorder',userAuth.verifyUser,calculateCartCount,orderController.PlaceOrder)
user.post('/addAddress-Checkout',userAuth.verifyUser,calculateCartCount,orderController.addAddress)
user.post('/placeOrder',userAuth.verifyUser,calculateCartCount,orderController.postCheckout)
user.get('/ordersuccess',userAuth.verifyUser,calculateCartCount,orderController.orderSuccess)
user.get('/trackOrder',userAuth.verifyUser,calculateCartCount,orderController.orderHistory)
user.post('/verify-payment',userAuth.verifyUser,calculateCartCount,orderController.verifyPayment)



//profile
user.get('/profile',userAuth.verifyUser,calculateCartCount,userController.userProfile)
user.get('/viewproduct/:orderId',userAuth.verifyUser,calculateCartCount,userController.vieworderedProduct)
user.get('/cancelorder/:orderId',userAuth.verifyUser,calculateCartCount,userController.cancelOrder)
user.get('/address',userAuth.verifyUser,calculateCartCount,userController.address)
user.post('/addaddressProfile',userAuth.verifyUser,calculateCartCount,userController.addaddressProfile)
user.delete('/deleteAddress/:addressId',userAuth.verifyUser,calculateCartCount,userController.deleteAddress)
user.post('/updateProfile',userAuth.verifyUser,calculateCartCount,userController.updateProfile)
user.get('/accountSettings',userAuth.verifyUser,calculateCartCount,userController.accountSettings)
user.post('/userPasswordReset',userAuth.verifyUser,calculateCartCount,userController.userPasswordReset)
user.get('/edituserAddress/:addressId',userAuth.verifyUser,calculateCartCount,userController.edituserAddress)
user.post('/edituserAddress/:addressId',userAuth.verifyUser,calculateCartCount,userController.updateediteduserAddress)
user.post('/downloadinvoice',userAuth.verifyUser,calculateCartCount,userController.generateInvoices)
user.get('/downloadinvoice/:orderId',userAuth.verifyUser,calculateCartCount,userController.downloadInvoice)
user.get('/aboutus',userAuth.verifyUser,calculateCartCount,userController.aboutUs)

//logout
user.get("/logout",userController.logOut)





module.exports = user;    