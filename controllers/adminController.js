const bcrypt = require("bcrypt");
require('../config/DBconnection')
const Admin=require('../model/adminSchema')
const Category = require("../model/categorySchema");
const Brands = require("../model/brandSchema");
const User= require("../model/userSchema")
const Product = require("../model/productSchema");
const multer = require("multer");
const { UserBindingContextImpl } = require("twilio/lib/rest/ipMessaging/v2/service/user/userBinding");
const { ObjectId } = require("mongodb");


//get admin login
const adminlogin=(req,res)=>{
    res.render('admin/adminlogin')
};



//post admin login
const adminLogged = async (req, res) => {
  try {
    const { email, password } = req.body;
  
    const adminData = await Admin.findOne({ email: email });

    if (!adminData) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, adminData.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    } else {
      req.session.logged = true;
      req.session.adminId = adminData._id;
      res.redirect('/admin/dashboard');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};



  //admin logged
  const isAdmin = (req, res) => {
    res.render('admin/adminDash')
  }


  //customers
  const Customers = async (req, res) => {
      try {
        const users = await User.getUsers();
        res.redirect('/admin/status');
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
  };

  

 //block user
 const user_Blocking = async(req,res)=>{
    try{
      const id = req.params.id;
  const blockData = await User.findOne({ _id: id });
  if (blockData.Status == "Active") {
    const blocked = await User.updateOne({ _id: id }, { Status: "Blocked" });
  } else if (blockData.Status == "Blocked") {
    const blocked = await User.updateOne({ _id: id }, { Status: "Active" });
  }
  // const pageNum = req.query.page;
  // const perPage = 10;
  // const users = await User.find()
  //   .skip((pageNum - 1) * perPage)
  //   .limit(perPage);
  // let i = (pageNum - 1) * perPage;
res.redirect('/admin/status');
  // res.render("admin/adminCustomer", { title: "admin-user list", users, i });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    } 

 }


const status = async(req,res) => {
    const pageNum = req.query.page;
  const perPage = 10;
  const users = await User.find()
    .skip((pageNum - 1) * perPage)
    .limit(perPage);
  let i = (pageNum - 1) * perPage;

  res.render("admin/adminCustomer", { title: "admin-user list", users, i });
}




//admin sighout
const adminLogout=(req,res)=>{
  req.session.destroy();
  res.redirect('/admin/login')
}




module.exports =
 {
    adminlogin,
    adminLogged,
    isAdmin,
    Customers,
    user_Blocking,
    status,
    adminLogout
 
};