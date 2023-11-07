require('../config/DBconnection')
const Product = require("../model/productSchema");
const Brands = require("../model/brandSchema");
const Category = require("../model/categorySchema");
const Categories = require('../model/categorySchema');
const { ObjectId } = require("mongodb");
const Wishlist=require('../model/wishlistSchema')
const register=require('../model/userSchema');
const { findByIdAndDelete } = require('../model/adminSchema');





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
        const page = parseInt(req.query.page) || 1; 
        const productsCount = await Product.find().count();
        const pageSize = 5; 
        const totalProducts = Math.ceil(productsCount / pageSize);
        const skip = (page - 1) * pageSize;

        const viewallProducts = await Product.find().skip(skip).limit(pageSize);
        const userWishlist = await Wishlist.findOne({ user: userId });
        const wishlist = userWishlist ? userWishlist.products : [];
    
        res.render('user/shop', {
           viewallProducts,
           username,
           wishlist,
           productsCount: totalProducts ,
           page: page
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

        console.log('reached ++++')
        const { image1, image2, image3, image4 } = req.files; 

    const updatedImages = {
      mainimage: (image1 && image1[0]) ? image1[0].filename : '',
      image1: (image2 && image2[0]) ? image2[0].filename : '',
      image2: (image3 && image3[0]) ? image3[0].filename : '',
      image3: (image4 && image4[0]) ? image4[0].filename : ''
    };
      
    
        const {
          productname,
          price,
          discountprice,
          brand,
          category,
          description,
          stock,
          Spec1,
          Spec2,
          Spec3,
          Spec4
        } = req.body;

      
        let categoryId = await Category.find({ name: category });
        let brandId = await Brands.findOne({ name: brand });
       
        const data = {
          name: productname,
          images: [updatedImages], 
          description: description,
          stock: stock,
          basePrice: price,
          descountedPrice: discountprice,
          timeStamp: Date.now(),
          brandId: new ObjectId(brandId._id),
          categoryId: new ObjectId(categoryId._id),
          highlight1:Spec1,
          highlight2:Spec2,
          highlight3:Spec3,
          highlight4:Spec4
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
  const updateProduct = async (req, res) => {
    try {
      const productId = req.params.productId;
      const { productname, price, discountprice, brand, category, description, stock } = req.body;
    
      const { image1, image2, image3, image4 } = req.files; 
  
      const existingProduct = await Product.findById({_id: productId});
      const existingImages = existingProduct.images[0];  
      // console.log(existingProduct);
      if (!existingProduct) {
        return res.status(404).send('Product not found');
      }
  
    
  
      const updatedImages = {
        mainimage: (image1 && image1[0]) ? image1[0].filename : existingImages.mainimage,
        image1: (image2 && image2[0]) ? image2[0].filename : existingImages.image1,
        image2: (image3 && image3[0]) ? image3[0].filename : existingImages.image2,
        image3: (image4 && image4[0]) ? image4[0].filename : existingImages.image3
      };
  
      const categoryId = await Categories.findOne({ name: category });
      const brandId = await Brands.findOne({ name: brand });
      

      

      if (!categoryId || !brandId) {
        return res.status(404).send('Category or brand not found');
      }

  
      const updatedProductData = {
        name: productname,
        basePrice: price,
        description: description,
        brandId: brandId._id,
        categoryId: categoryId._id,
        stock: stock,
        descountedPrice: discountprice,
        $set: {
          images: [updatedImages], 
          timeStamp: Date.now(),
        }
      };

     
  
      await Product.updateOne({ _id: productId }, updatedProductData );
  
     
      res.redirect('/admin/products');
    } catch (err) {
      console.log(err);
     res.render('error/admin404')
    }
  };
  
  
  
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
  

  //generate sales report in pdf
  const generatepdf=async(req,res)=>{
    try {
      console.log("staticBackdrop");
    } catch (error) {
      console.log("error while generating sales report pdf");
    }
  }
  

  const deletesingleImage = async (req, res) => {
    try {
      const productId = req.params.id;
      const imageIndex = req.params.index;
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).send('Product not found');
      }
  
      let imageField = '';
      let deletedImage = '';
  
      if (imageIndex === '0') {
        imageField = 'images.0.mainimage';
        deletedImage = product.images[0].mainimage;
      } else if (imageIndex === '1') {
        imageField = 'images.0.image1';
        deletedImage = product.images[0].image1;
      } else if (imageIndex === '2') {
        imageField = 'images.0.image2';
        deletedImage = product.images[0].image2;
      } else if (imageIndex === '3') {
        imageField = 'images.0.image3';
        deletedImage = product.images[0].image3;
      } else {
        return res.status(404).send('Image not found');
      }
  
      await Product.updateOne({ _id: productId }, { $unset: { [imageField]: 1 } });
  
      return res.status(200).send(`Image '${deletedImage}' deleted successfully`);
    } catch (error) {
      console.error('Error while deleting the product image:', error);
      res.status(500).send('Internal Server Error');
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
    generatepdf,
    deletesingleImage
  }