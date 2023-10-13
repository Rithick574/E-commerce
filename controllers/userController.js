require('dotenv').config();
const Twilio = require('twilio');
const bcrypt = require("bcrypt");
require('../config/DBconnection')
const register=require('../model/userSchema')
const {sentOTP} = require("../auth/OTPauth");
const product = require('../model/productSchema');


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.VERIFY_SID;

const client = require('twilio')(accountSid, authToken);



//homepage rendering(anonymous)
const homePage = async(req, res) => {
  const username =req.session.user;
  if(req.session.loggedin){
    const data= await product.find()
    res.render('user/home',{product:data, username})
  }else{
    res.redirect('/guestuser')
  }
  };
//guest
  const guestPage=async(req,res)=>{
   if(req.session.loggedin){
    res.redirect('/')
   }else{
    const username =req.session.user;
    const data= await product.find()
    res.render('user/guestUser',{title:'Guest User',product:data,username})
   }
  }


  //post user logged
  const logged = async (req, res) => {
    const { email, password } = req.body;
    const connect = await register.findOne({ email: email });
    console.log(connect);
  
    if (connect) {
      console.log(req.body);
      let isMatch = await bcrypt.compare(req.body.password, connect.password);
      if (isMatch) {
        if (connect.Status == "Active") {
          console.log("login successful");
          req.session.user = req.body.email;
          req.session.loggedin = true;
          return res.redirect("/");
        } else {
          console.log("user account blocked by admin");
          const errr1 = "Your account has been blocked by the admin.";
          return res.render('user/userLogin', { errr:errr1 });
        }
      }else{
        console.log("user account blocked by admin");
          const errr1 = "Invalid  Password";
          return res.render('user/userLogin', { errr:errr1 });
      }
    }
    console.log("log in failed...");
    return res.render("user/userLogin", { errr: "" });
  }



//get login
const login = (req,res)=>{
  if(req.session.loggedin){
    res.redirect('/')
  }
  else{
    res.render('user/userLogin',{errr:''})
  }
}

const passport= async(req, res)=>{
  try{
    console.log(req.user)
    res.redirect('/');
  }catch(error){
    throw error
  }
}


//user signup 
const signup=(req,res)=>{
if(req.session.loggedin){
res.redirect('/')
}else{
  res.render('user/userSignup')
}
}

//sent OTP
const sentOtp = async (req, res) => {
 if(req.session.loggedin){
res.redirect('/')
 }else{
  
  try {
    const { phone, email, password, name } = req.body;
    req.session.user = req.body.email;
    const pass = await bcrypt.hash(password, 10);
  
      const destruc_data={
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        password:pass
      }
      req.session.data=destruc_data;
  
      const datas = await register.findOne({ $or: [{ email }, { phone }] });
      if (datas) {
        console.log("Email or phone number already exists");
        res.redirect('/signup');
      }
  
      const data = await sentOTP(phone);
      console.log(data.phone);
  
      return res.render("user/otp", { data, phone });
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal server error");
    }
 }
}


//verify OTP
const verifyOTP = async (req, res) => {
if(req.session.loggedin){
res.redirect('/')
}else{
  try {
    const otpDigits = [
      req.body.num1,
      req.body.num2,
      req.body.num3,
      req.body.num4,
      req.body.num5,
      req.body.num6,
    ];

    const phone = req.body.phone;

    console.log('Phone Number:', phone);

    const verifiedResponse = await client.verify.v2
    .services(verifySid)
    .verificationChecks.create({
      to: `+91${phone}`, 
      code: otpDigits.join(''),
    });

    if (verifiedResponse.status === 'approved') {
      console.log('OTP verified successfully');

      


      const timeStamp = new Date();
      const year = timeStamp.getFullYear();
      const month = String(timeStamp.getMonth() + 1).padStart(2, '0'); 
      const day = String(timeStamp.getDate()).padStart(2, '0');
      
      const formattedDate = `${year}-${month}-${day}`;
      
      const {name,phone,email,password}=req.session.data
      const userdata = {
        name: name,
        email: email,
        password: password,
        phone: phone,
        timeStamp: formattedDate,
      };

        const insert = await register.insertMany([userdata]);
        req.session.loggedin=true;
        return res.redirect('/'); 
      
    }else{
      console.log('Invalid OTP');
      res.status(500).send('Invalid otp');
    }
  } catch(err) {
    throw err;
  }
}
}






const forgotPassword=(req,res)=>{
 if(req.session.loggedin){
res.redirect('/')
 }else{
  res.render('user/forgotpassword', {data:""})
 }
}

const sentforgotOTP= async(req,res)=>{
 if(req.session.loggedin){
  res.redirect('/')
 }else{
  const{phone}=req.body;
  const datass = await sentOTP(phone);
  console.log(datass.phone);
 res.render('user/forgototp',{data: datass.phone})
 }
}

const verifygorgotOTP=async(req,res)=>{
  if(req.session.loggedin){
    res.redirect('/')
  }else{
    try{
      const otpDigits = [
        req.body.num1,
        req.body.num2,
        req.body.num3,
        req.body.num4,
        req.body.num5,
        req.body.num6,
          ];
  
          const phone = req.body.formType;
  
          console.log('Phone Number1:',phone);
  
          const otp = otpDigits.join('');
  
          const verifySid = process.env.VERIFY_SID;
      
          const verifiedResponse = await client.verify.v2
            .services(verifySid)
            .verificationChecks.create({
              to: `+91${phone}`, 
              code: otp,
            });
      
          if (verifiedResponse.status === 'approved') {
          
            console.log('OTP verified successfully');
            
            res.render('user/resetpassword',{phone})
          } else {
            console.log('Invalid OTP');
            res.status(500).send('Invali otp');
          }
     }catch(error){
      throw error
  
     }
  }
}

const resetpassword=async(req,res)=>{
  if(req.session.loggedin){
    res.redirect('/')
  }else{
    try{
      const pass = await bcrypt.hash(req.body.password, 10);
   const phone = req.body.reset;
   console.log(phone);
   const filter = {  phone: phone };
  
   const update = {
    $set: {
      password: pass,
    },
  }
  const result = await register.updateOne(filter, update);
  console.log("hi hello");
  res.redirect('/login')
  
    }catch(error){
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
}


//view product
const viewProduct=async(req,res)=>{
if(req.session.loggedin){
  try{
    const productId = req.params.productId;
    const username =req.session.user;
    const productData= await product.findById(productId);
    console.log("view productsa");
    res.render('user/viewproduct', { product: productData,username});
   }catch(error){
    res.status(500).send('internal server error')
   }
}else{
  res.redirect('/logout');
}

}

//guest view product
const viewProductGuest=async(req,res)=>{
    try{
      const productId = req.params.productId;
      const username =req.session.user;
      const productData= await product.findById(productId);
      console.log("view productsa");
      res.render('user/viewproduct', { product: productData,username});
     }catch(error){
      res.status(500).send('internal server error')
     }
  }


//shop
const ShopProduct=async(req,res)=>{
 if(req.session.loggedin){
  try{
    const username =req.session.user;
    const viewallProducts = await product.find();
    res.render('user/shop', { viewallProducts,username});

  }catch(error){
    console.error(error);
        res.status(500).send('Internal Server Error');
  }
 }
 else{
  res.redirect('/logout')
 }
}

//shop for guest
const ShopProductGuest=async(req,res)=>{
   try{
     const username =req.session.user;
     const viewallProducts = await product.find();
     res.render('user/shop', { viewallProducts,username});
 
   }catch(error){
     console.error(error);
         res.status(500).send('Internal Server Error');
   }
 }

//wishlist
const wishList=(req,res)=>{
  if(req.session.loggedin){
    const username =req.session.user;
    res.render('user/wishlist',{username})
  }else{
    res.redirect('/logout')
  }
}

//logout
const logOut=(req,res)=>{
  req.session.destroy();
  res.redirect('/')
}




  
  module.exports = {
    homePage,
    guestPage,
    login,
    logged,
    signup,
    sentOtp,
    verifyOTP,
    forgotPassword,
    sentforgotOTP,
    verifygorgotOTP,
    resetpassword,
    passport,
    viewProduct,
    ShopProduct,
    wishList,
    viewProductGuest,
    ShopProductGuest,
    logOut
  };
