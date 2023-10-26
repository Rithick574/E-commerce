require("dotenv").config();
const Twilio = require("twilio");
const bcrypt = require("bcrypt");
require("../config/DBconnection");
const Order = require("../model/orderSchema");
const register = require("../model/userSchema");
const { sentOTP } = require("../auth/OTPauth");
const PRODUCT = require("../model/productSchema");
const Wishlist=require('../model/wishlistSchema')


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.VERIFY_SID;

const client = require("twilio")(accountSid, authToken);

//homepage rendering(anonymous)
const homePage = async (req, res) => {
  try {
    const username = req.session.user;
    const data = await PRODUCT.find({ isDeleted: false });
    const user = await register.findOne({ email: username });
    const userId = user._id;
    const userWishlist = await Wishlist.findOne({ user: userId });
    const wishlist = userWishlist ? userWishlist.products : [];

   
    res.render("user/home", { 
      product: data, 
      username,
      wishlist,
      cartCount: res.locals.cartCount
    });

  } catch (error) {
    console.error(error);
    return res.render('error/404')
  }
};

//guest
const guestPage = async (req, res) => {
    const username = req.session.user;
    try {
      const data = await PRODUCT.find();
      res.render("user/guestUser", {
        title: "Guest User",
        product: data,
        username,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
};

//post user logged
const logged = async (req, res) => {
  try {
    const { email, password } = req.body;
    const connect = await register.findOne({ email: email });

    if (connect) {
      let isMatch = await bcrypt.compare(password, connect.password);
      if (isMatch) {
        if (connect.Status == "Active") {
          console.log("login successful");
          req.session.user = req.body.email;
          req.session.loggedin = true;
          return res.redirect("/");
        } else {
          console.log("user account blocked by admin");
          const errr1 = "Your account has been blocked by the admin.";
          return res.render("user/userLogin", { errr: errr1 });
        }
      } else {
        console.log("Invalid Password");
        const errr1 = "Invalid Password";
        return res.render("user/userLogin", { errr: errr1 });
      }
    } else {
      console.log("User not found");
      return res.render("user/userLogin", { errr: "User not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//get login
const login = (req, res) => {
  
    res.render("user/userLogin", { errr: "" });
  
};


const passport = (req, res) => {
  try {
    console.log(req.user);
    res.redirect("/");
  } catch (error) {
    throw error;
  }
};

//user signup

const signup = (req, res) => {
    res.render("user/userSignup");
};


//sent OTP
const sentOtp = async (req, res) => {
    try {
      const { phone, email, password, name } = req.body;
      req.session.user = req.body.email;
      const pass = await bcrypt.hash(password, 10);

      const destruc_data = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: pass,
      };
      req.session.data = destruc_data;

      const datas = await register.findOne({ $or: [{ email }, { phone }] });
      if (datas) {
        console.log("Email or phone number already exists");
        res.redirect("/signup");
      }

      const data = await sentOTP(phone);
      console.log(data.phone);

      return res.render("user/otp", { data, phone });
    } catch (error) {
      console.log(error);
      res.render('error/404')
    }
  
};

//verify OTP
const verifyOTP = async (req, res) => {
  
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

      console.log("Phone Number:", phone);

      const verifiedResponse = await client.verify.v2
        .services(verifySid)
        .verificationChecks.create({
          to: `+91${phone}`,
          code: otpDigits.join(""),
        });

      if (verifiedResponse.status === "approved") {
        console.log("OTP verified successfully");

        const timeStamp = new Date();
        const year = timeStamp.getFullYear();
        const month = String(timeStamp.getMonth() + 1).padStart(2, "0");
        const day = String(timeStamp.getDate()).padStart(2, "0");

        const formattedDate = `${year}-${month}-${day}`;

        const { name, phone, email, password } = req.session.data;
        const userdata = {
          name: name,
          email: email,
          password: password,
          phone: phone,
          timeStamp: formattedDate,
        };

        const insert = await register.insertMany([userdata]);
        req.session.loggedin = true;
        req.session.user = email;
       
        return res.redirect("/");
      } else {
        console.log("Invalid OTP");
        res.render('error/404')
      }
    } catch (err) {
      throw err;
    }
};


//resend otp
const resendOTP= async(req,res)=>{
  try{
    const phone = req.session.data.phone;
  console.log(phone+"resending");

  const data = await sentOTP(phone);

  console.log(data.phone+"resended successfully");
  res.json({ success: true });
  }catch (error) {
    res.status(500).json({ success: false, error: "Failed to resend OTP" });
  }
}





const forgotPassword = (req, res) => {
    res.render("user/forgotpassword", { data: "" });
};


const sentforgotOTP = async (req, res) => {
 
    const { phone } = req.body;
    const datass = await sentOTP(phone);
    console.log(datass.phone);
    res.render("user/forgototp", { data: datass.phone });
};

const verifygorgotOTP = async (req, res) => {
    try {
      const otpDigits = [
        req.body.num1,
        req.body.num2,
        req.body.num3,
        req.body.num4,
        req.body.num5,
        req.body.num6,
      ];

      const phone = req.body.formType;

      console.log("Phone Number1:", phone);

      const otp = otpDigits.join("");

      const verifySid = process.env.VERIFY_SID;

      const verifiedResponse = await client.verify.v2
        .services(verifySid)
        .verificationChecks.create({
          to: `+91${phone}`,
          code: otp,
        });

      if (verifiedResponse.status === "approved") {
        console.log("OTP verified successfully");

        res.render("user/resetpassword", { phone });
      } else {
        console.log("Invalid OTP");
        res.status(500).send("Invali otp");
      }
    } catch (error) {
      throw error;
    }
};

const resetpassword = async (req, res) => {
    try {
      const pass = await bcrypt.hash(req.body.password, 10);
      const phone = req.body.reset;
      console.log(phone);
      const filter = { phone: phone };

      const update = {
        $set: {
          password: pass,
        },
      };
      const result = await register.updateOne(filter, update);
      res.redirect("/login");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    } 
};


//user Profile
const userProfile = async (req, res) => {
  const username = req.session.user; 

  try {
      const data = await register.find({ email: username });
      // console.log(data);

      res.render('user/userProfile', { profile: data[0], username });
  } catch (error) {
    console.log('profile error');
     res.render('error/404')
  }
};

//view ordered product
const vieworderedProduct=async(req,res)=>{
try {
  const username=req.session.user
  const orderId = req.params.orderId;
  const order = await Order.findById(orderId).populate('Items.productId');
  if (!order) {
      return res.render('error/404'); 
  }
  res.render('user/productDetails', { orderedProducts: order.Items,username });

} catch (error) {
  console.error('Error viewing ordered products:', error);
  res.render('error/404');
}
}



//cancel order user side
const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);

    if (!order) {
      console.log('Order not found');
      return res.render('error/404');
    }

    if (order.Status === "Order Placed" || order.Status === "Shipped") {
      const productsToUpdate = order.Items;
      for (const product of productsToUpdate) {
        const cancelProduct = await PRODUCT.findById(product.ProductId);

        if (cancelProduct) {
          cancelProduct.AvailableQuantity += product.Quantity;
          await cancelProduct.save();
        }
      }
      order.Status = "Cancelled";
      await order.save();
      return res.redirect("/trackOrder");
    } else {
      console.log("Order cannot be cancelled");
     
    }
  } catch (error) {
    console.error("Error cancelling the order:", error);
    res.render('error/404');
  }
};

//address page view in profile
const address=async(req,res)=>{
  try {
    const username=req.session.user;
    const user = await register.findOne({ email: username });

     if (user) {
      res.render('user/address', {username, user });
    } else {
      console.log("User not found");
      res.render('error/404');
    }
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
}

//add address profile 
const addaddressProfile=async(req,res)=>{
  try {
    const addressData = {
      Name: req.body.Name,
      AddressLane: req.body.Address,
      City: req.body.City,
      Pincode: req.body.Pincode,
      State: req.body.State,
      Mobile: req.body.Mobile,
  };
  const userEmail = req.session.user;
  
  const user = await register.findOne({ email: userEmail });
  if (!user) {
    return res.render('user/404');
}
  user.Address.push(addressData);
        await user.save();
        return res.redirect('/address');
  
 
  } catch (error) {
    res.render('error/404')
  }
}


//delete address from the profile
const deleteAddress = async (req, res) => {
  try {
      const userEmail = req.session.user;
      const user = await register.findOne({ email: userEmail });

      if (!user) {
        console.log('User not found');
        res.render('error/404')
      }
      const addressId = req.params.addressId; 
      const userId = user._id;

      await register.findOneAndUpdate(
        { _id: userId },
        { $pull: { Address: { _id: addressId } } }
      );
      res.json({success:true})
  } catch (err) {
      console.error('Error deleting address:', err);
     res.render('error/404')
  }
};



//logout
const logOut = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};

module.exports = {
  homePage,
  guestPage,
  login,
  logged,
  signup,
  sentOtp,
  verifyOTP,
  resendOTP,
  forgotPassword,
  sentforgotOTP,
  verifygorgotOTP,
  resetpassword,
  passport,
  userProfile,
  cancelOrder,
  vieworderedProduct,
  address,
  addaddressProfile,
  deleteAddress,
  logOut,
};
