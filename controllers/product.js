require('../config/DBconnection')
const Product = require("../model/productSchema");
const Brands = require("../model/brandSchema");
const Category = require("../model/categorySchema");
const Categories = require('../model/categorySchema');
const { ObjectId } = require("mongodb");
const Wishlist=require('../model/wishlistSchema')
const register=require('../model/userSchema')





/////USER/////


//view product
const viewProduct=async(req,res)=>{
      try{
        const productId = req.params.productId;
        const username =req.session.user;
        const productData= await Product.findById(productId);
        console.log("view productsa");
        res.render('user/viewproduct', { product: productData,username});
       }catch(error){
        res.status(500).send('internal server error')
       }
    }
    
    //guest view product
    const viewProductGuest=async(req,res)=>{
        try{
          const productId = req.params.productId;
          const username =req.session.user;
          const productData= await Product.findById(productId);
          console.log(" guest view productsa");
          res.render('user/guestviewproduct', { product: productData,username});
         }catch(error){
          res.status(500).send('internal server error')
         }
      }
    
    
    //shop
    const ShopProduct=async(req,res)=>{
      try{
        const username =req.session.user;
        const user = await register.findOne({ email: username });
        const userId = user._id;
        const viewallProducts = await Product.find();
        const userWishlist = await Wishlist.findOne({ user: userId });
        const wishlist = userWishlist ? userWishlist.products : [];
    
        res.render('user/shop', {
           viewallProducts,
           username,
           wishlist
          });
    
      }catch(error){
        console.error(error);
            res.status(500).send('Internal Server Error');
      }
   
    }
    
    //shop for guest
    // const ShopProductGuest=async(req,res)=>{
    //    try{
    //      const username =req.session.user;
    //      const viewallProducts = await Product.find();
    //      res.render('user/shop', { viewallProducts,username});
     
    //    }catch(error){
    //      console.error(error);
    //          res.status(500).send('Internal Server Error');
    //    }
    //  }
    

     







/////ADMIN/////


//products
const Products = async (req, res) => {
   
      try {
        const products = await Product.find();
        res.render('admin/products', { products: products });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
  };

  //add products
  const addProduct=async(req,res)=>{
  
    try {
      const categories = await Category.find(); 
      const brands = await Brands.find(); 
      res.render('admin/addProducts', { categories, brands })
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
  }
  }
  

  //add product post
  const addProductPost=async(req,res)=>{

      try {

        console.log(req.session)
        console.log('reached ++++')
        const main = req.files["main"][0];
        const img1 = req.files["image1"][0];
        const img3 = req.files["image3"][0];
        const img2 = req.files["image2"][0];
  
  
    
      
    
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
        let categoryId = await Category.find({ name: category });
        let brandId = await Brands.findOne({ name: brand });
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





//editproduct 
const editProduct=async(req,res)=>{
      try {
        const productId = req.params.productId;
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).send('Product not found');
        }
        const brands = await Brands.find();
        const categories = await Category.find();
        res.render('admin/updateProduct', { product, brands, categories });
      } catch (err) {
        res.status(500).send('Internal Server Error');
      }
  
  }
  
  const updateProduct=async(req,res)=>{
  
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
          let brandId = await Brands.findOne({ name: brand });
          console.log(brandId);
          console.log(categoryId);
     //
      const Id = req.params.productId;
      console.log(Id);
      const updatedProductData = {
          name: productname,
          basePrice: price,
          description: description,
          brandId: brandId._id,
          categoryId: categoryId._id,
          stock: stock,
          descountedPrice: discountprice,
          images: {
            mainimage: main.filename,
            image1: img1.filename,
            image2: img2.filename,
            image3: img3.filename,
          },
          timeStamp: Date.now(),
      };
      console.log(updatedProductData);
      await Product.updateOne({ _id: new ObjectId(Id) }, { $set:updatedProductData });
  
      // if (!updatedProduct) {
      //   return res.status(404).send('Product not found');
      // }
      // console.log(updatedProduct);
      console.log("updated");
      res.redirect('/admin/products');
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal Server Error 1');
    }
 
  }
  
  //archieve product(dsoft delete)
  const archiveProduct = async (req, res) => {
  
      try {
        const { productId } = req.params;
        const product = await Product.findById(productId);
    
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }
    
        // Toggle the isDeleted field
        product.isDeleted = !product.isDeleted;
    
        // Save the updated product
        await product.save();
    
        if (product.isDeleted) {
          console.log('Product has been soft-deleted');
        } else {
          console.log('Product has been restored');
        }
    
        res.redirect('/admin/products');
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
      }
  
  };
  
  
 




  module.exports={
    viewProduct,
    ShopProduct,
    viewProductGuest,
    // ShopProductGuest,
    Products,
    addProduct,
    addProductPost,
    editProduct,
    updateProduct,
    archiveProduct,
  }