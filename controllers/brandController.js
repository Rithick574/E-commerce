require('../config/DBconnection')
const Brands = require("../model/brandSchema");



/////ADMIN///////


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



  module.exports={
    BrandsList,
    addBrands,
    AddBrandss,
  }
  