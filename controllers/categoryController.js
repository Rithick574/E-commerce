require('../config/DBconnection')
const Category = require("../model/categorySchema");



 //////ADMIN//////


 
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



   module.exports={
    CategoryList,
    AddCategory,
    AddCategoryy,
   }