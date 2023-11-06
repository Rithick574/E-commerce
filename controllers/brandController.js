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
    res.render('admin/addBrand',{error:""})
  }
  
  //add brands post 
  const AddBrandss=async(req,res)=>{
      try {
        const { Brand_name } = req.body;
        const normalizedBrandName = Brand_name.toLowerCase();

        const existingBrand = await Brands.findOne({ name: { $regex: new RegExp('^' + normalizedBrandName + '$', 'i') } });

        if (existingBrand) {
          return res.render('admin/addBrand', { error: 'Brand name already exists' });
        }

        const newBrand = new Brands({
          name: normalizedBrandName,
          timeStamp: new Date(),
        });
        
        const insertedBrand = await Brands.insertMany([newBrand]);
    
        if (insertedBrand.length > 0) {
          res.redirect('/admin/brands');
        } else {
         console.log("Brand insertion failed");
          res.render('error/admin404')
        }
    
      } catch (error) {
        if (error.code === 11000) {
          res.render('admin/addBrand',{ error: 'Brand name already exists' })
          console.error('Brand name already exists')
        } else {
          console.error(error);
          res.status(500).send('Internal Server Error');
        
        }
      }
  };


//delete brand

  const deleteBrand=async(req,res)=>{
    const brandId= req.params.brandId;
    try {
    
      const deleteBrand= await Brands.findByIdAndDelete(brandId)

      if(!deleteBrand){
        return res.status(404).json({ message: 'Brand not found or already deleted' });
      }

      res.redirect('/admin/brands')

    } catch (error) {
      console.error(error);
    }
  }



  //edit brand

  const editBrand=async(req,res)=>{
    const BrandId= req.params.brandId
    try {

      const Brand=await Brands.findById(BrandId)

      if(!Brand){
        res.status(404).json({messsage:"Brand not found"})
      }

      res.render('admin/editBrand',{ Brand,error:'' })

    } catch (error) {
      console.error('Error fetching brand for edit:', error);
    }
  }


  //update brand name
  const updateBrand=async(req,res)=>{
    try {

      const brandId= req.params.brandId;
      const updatedName= req.body.Brandname;

      const normalizedBrandName = updatedName.toLowerCase();

      const existingBrand = await Brands.findOne({ name: { $regex: new RegExp('^' + normalizedBrandName + '$', 'i') } });

      if (existingBrand) {
        return res.render('admin/editBrand', { Brand:updatedName, error: 'Brand name already exists' });
      }

      const updatetheBrand=await Brands.findByIdAndUpdate(brandId,{name:updatedName},{new:true})

      if(!updatetheBrand){
        res.render('error/admin404')
      }
      res.redirect('/admin/brands')
    } catch (error) {
      console.error("error while updating the brand name")
      res.render('error/admin404')
    }
  }


  module.exports={
    BrandsList,
    addBrands,
    AddBrandss,
    deleteBrand,
    editBrand,
    updateBrand

  }
  