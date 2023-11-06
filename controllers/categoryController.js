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

       res.render('admin/addCategory',{error:""})
       
   }
   
   const AddCategoryy=async (req,res)=>{
      const { categoryName } = req.body;
       try {
        const normalizedCategoryName = categoryName.toLowerCase();

        const existingCategory = await Category.findOne({ name: { $regex: new RegExp('^' + normalizedCategoryName + '$', 'i') } });

        if (existingCategory) {
            return res.render('admin/addCategory', { error: 'Category name already exists' });
        }

         const newCategory = new Category({
           name: normalizedCategoryName,
           timeStamp: new Date(),
         });
     
         const insertResult = await Category.insertMany([newCategory]);
         res.redirect('/admin/category');
       } catch (error) {
         console.error(error);
         console.error(error);
        res.render('error/admin404')
       }
   }


   //delete category name
  
   const deleteCategory=async(req,res)=>{
    try {
      const categoryId= req.params.categoryId;
      console.log(categoryId);
      const deleteCategory= await Category.findByIdAndDelete(categoryId)

      if(!deleteCategory){
        res.status(404).json({message:"category not found"})
      }
      // return res.status(200).json({ message: "Category deleted successfully" });
      res.json({success : true})

    } catch (error) {
      console.error('error while deleting the category',error)
    }
   }


   const editCategory=async(req,res)=>{
try {
  const categoryedit=req.params.categoryId;
  const category=await Category.findById(categoryedit)
  if(!category){
    return res.render('error/admin404')
  }
  res.render('admin/editCategory',{category,error:''})
} catch (error) {
  console.error('error while editing the category:',error)
}
   }


   //update category name

   const updateCategory=async(req,res)=>{
    try {
      const categoryId= req.params.categoryId;
    const updatedName= req.body.categoryName;

    const normalizedCategoryName = updatedName.toLowerCase();

        const existingCategory = await Category.findOne({ name: { $regex: new RegExp('^' + normalizedCategoryName + '$', 'i') } });

        if (existingCategory) {
            return res.render('admin/editCategory', {category:updatedName, error: 'Category name already exists' });
        }


    const updatedCategory = await Category.findByIdAndUpdate(categoryId,{name:updatedName},{new: true})

    if(!updatedCategory){
      res.render('error/admin404')
    }
    res.redirect('/admin/category')
    } catch (error) {
      console.error("error while update category",error)
      res.render('error/admin404')
    }
   }


   module.exports={
    CategoryList,
    AddCategory,
    AddCategoryy,
    deleteCategory,
    editCategory,
    updateCategory
   }