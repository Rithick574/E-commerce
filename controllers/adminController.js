const bcrypt = require("bcrypt");
require('../config/DBconnection')
const Admin=require('../model/adminSchema')
const Category = require("../model/categorySchema");
const Brands = require("../model/brandSchema");
const User= require("../model/userSchema")
const Product = require("../model/productSchema");
const multer = require("multer");
const { UserBindingContextImpl } = require("twilio/lib/rest/ipMessaging/v2/service/user/userBinding");
const Categories = require("../model/categorySchema");
const { ObjectId } = require("mongodb");


const adminlogin=(req,res)=>{
    res.render('admin/adminlogin')
};

const adminLogged = async (req, res) => {
    try {
      const { email, password } = req.body;
      
     
      const adminData = await Admin.findOne({ email: email, password: password });
  
      if (!adminData) {
        return res.status(401).json({ message: "Invalid credentials" });
      }else{
        req.session.adminId = adminData._id;
        // res.status(200).json({ message: "Admin logged in successfully" });
        res.redirect('/admin/dashboard')
      }   
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };


  //admin logged
  const isAdmin=(req,res)=>{
    res.render('admin/adminDash')
  }

  //customers
  const Customers = async (req, res) => {
    try {
        const users = await User.getUsers();
        res.redirect('/admin/status')
        // res.render('admin/adminCustomer', { users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

  //products
  const Products= async(req,res)=>{
    try {
      const products = await Product.find();
      // const count=Math.floor(products.length/10);
      res.render('admin/products', { products: products })
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
  }
   
  }

  //add products
  const addProduct=(req,res)=>{
    res.render('admin/addProducts')
  }
  
  //logout
  const logOut=(req,res)=>{
    // req.session.distroy();
    res.redirect('/admin/login')
  }

  //add product post
  const addProductPost=async(req,res)=>{
    try {
      console.log('reached ++++')
      const main = req.files["main"][0];
      const img1 = req.files["image1"][0];
      const img3 = req.files["image3"][0];
      const img2 = req.files["image2"][0];


  
      console.log("Uploaded files:");
      console.log(main);
      console.log(img1);
      console.log(img2);
      console.log(img3);

  
      const {
        productname,
        price,
        discountprice,
        brand,
        category,
        description,
        stock,
      } = req.body;
  
      console.log("name is " + productname);
      let categoryId = await Categories.find({ name: category });
      let brandId = await Brand.findOne({ name: brand });
      console.log(brandId);
      console.log(categoryId);
      const data = {
        name: productname,
        images: {
          mainimage: main.filename,
          image1: img1.filename,
          image2: img2.filename,
          image3: img3.filename,
        },
        description: description,
        stock: stock,
        basePrice: price,
        descountedPrice: discountprice,
        timeStamp: Date.now(),
        brandId: new ObjectId(brandId._id),
        categoryId: new ObjectId(categoryId._id),
      };
      const insert = await Product.insertMany([data]);
      res.redirect("/admin/products");
    } catch (err) {
      console.log("error found" + err);
    }
    
  }



  //block user
 const user_Blocking = async(req,res)=>{
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


//add brandslist
const BrandsList=async (req,res)=>{
  const brands = await Brands.find();
res.render('admin/Brands',{brands})
}

// add brands
const addBrands=(req,res)=>{
  res.render('admin/addBrand')
}

//add brands post 
const AddBrandss=async(req,res)=>{
  try {
    const { Brand_name } = req.body;
    console.log(Brand_name);
    const newBrand = new Brands({
      name: Brand_name,
      timeStamp: new Date(),
    });
    
    const insertedBrand = await Brands.insertMany([newBrand]);

    if (insertedBrand.length > 0) {
      res.redirect('/admin/brands');
    } else {
      // Handle the case where no brand was inserted
      res.status(500).send('Brand insertion failed.');
    }

  } catch (error) {
    if (error.code === 11000) {
      res.status(400).send('Brand name already exists.');
    } else {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
};



//category
const CategoryList=async(req,res)=>{
  try {
    const categories = await Category.find();
    res.render('admin/Category', { categories });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

//add category
const AddCategory=(req,res)=>{
  res.render('admin/addCategory')
}

const AddCategoryy=async (req,res)=>{
  try {
    const { categoryName } = req.body;
    console.log(categoryName);

    const newCategory = new Category({
      name: categoryName,
      timeStamp: new Date(),
    });

    const insertResult = await Category.insertMany([newCategory]);
    res.redirect('/admin/category');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}




//admin sighout
const adminLogout=(req,res)=>{
  res.render('admin/login')
}




module.exports =
 {
    adminlogin,
    adminLogged,
    isAdmin,
    Customers,
    Products,
    addProduct,
    logOut,
    addProductPost,
    user_Blocking,
    status,
    BrandsList,
    addBrands,
    CategoryList,
    AddCategory,
    AddBrandss,
    AddCategoryy,
    adminLogout
 
};