const express=require('express')
const session = require("express-session");
const admin = express.Router();
const adminController=require("../controllers/adminController")
const multer = require("multer");

const { addProductPost } = require("../controllers/adminController");
// const multer = require('multer');
const path = require('path');
const crypto=require("crypto");
// handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/product-images/'); 
  },
  filename: (req, file, cb) => {
    const randomeString = crypto.randomBytes(3).toString("hex");
    const timestamp = Date.now();
    const uniqueFile = `${timestamp}-${randomeString}`;
    cb(null, uniqueFile + ".png");
  },
});

const upload = multer({ storage,});  

const uploadFields = [
  { name: 'main', maxCount: 1 },
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
];




// Admin login page
admin.get('/login', adminController.adminlogin);

//Admin login Route
admin.post('/login', adminController.adminLogged);

// // Protected admin dashboard route
admin.get('/dashboard', adminController.isAdmin)
admin.get('/customers',adminController.Customers)

admin.get('/products',adminController.Products)
admin.get('/addProduct',adminController.addProduct)
admin.get('/logout',adminController.logOut)
admin.get('/status',adminController.status)
// admin.post('/addproduct',adminController.addProductPost)
admin.get('/block/:id',adminController.user_Blocking)

//add brand
admin.get('/brands',adminController.BrandsList)
admin.get('/addbrand',adminController.addBrands)
admin.post('/add-brand',adminController.AddBrandss)

//add category
admin.get('/category',adminController.CategoryList)
admin.get('/add-category',adminController.AddCategory)
admin.post('/add-category',adminController.AddCategoryy)

//multiple image upload using multer
admin.post("/upload", upload.fields(uploadFields),addProductPost);



// // Admin logout route
admin.get('/logout', adminController.adminLogout);



module.exports={admin};