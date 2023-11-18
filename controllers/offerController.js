require('../config/DBconnection')
const Offer=require('../model/offerSchema')
const Category=require('../model/categorySchema')
const products=require('../model/productSchema')
const Refferal=require('../model/referralSchema')

const categoryOffer=async(req,res)=>{
    try {
        const offer=await Offer.find()
        const date = new Date()
        const categories= await Category.find()
        res.render('admin/categoryOffer',{offer,date,categories})
    } catch (error) {
        console.error('error while rendering the offerlist page:',error)
    }
}


//add category offer
const addCategoryOffer = async (req, res) => {
    try {
        const { categoryName, offerPercentage, expiryDate } = req.body;
        const newOffer = new Offer({
            categoryName,
            offerPercentage,
            expiryDate,
            status: 'Active', 
        });
        await newOffer.save();

        const fetchCategoryId=await Category.findOne({name:categoryName})
        const cateGoryId=fetchCategoryId._id


        const productsBeforeOffer = await products.find({ categoryId: cateGoryId});
        const discountPrice=productsBeforeOffer.descountedPrice;
        const insertBeforeOffer = await products.updateMany(
            { categoryId: cateGoryId },
            { $set: { beforeOffer: discountPrice } }
          );

       
        const offerMultiplier = 1 - offerPercentage / 100;

        const productData = await products.updateMany(
          { categoryId: cateGoryId },
          {
            $mul: { descountedPrice: offerMultiplier },
          }
        );

        res.status(201).json({ success: true, message: 'Category offer added successfully' });

    } catch (error) {
        console.error('Error while adding the category offer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


//delete offer
const deleteOffer=async(req,res)=>{
    try {
        const offerId = req.params.offerId;
        await Offer.findByIdAndDelete(offerId);
        res.json({ success: true, message: 'Offer deleted successfully' });
    } catch (error) {
        console.error('Error deleting offer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

//get category name
const getCategoryName = async (req, res) => {
    try {
        const categoryNames = req.params.categoryName;
        const categoryName = categoryNames.trim();

        const existingCategory = await Category.findOne({ name: categoryName });
        if(existingCategory){
            res.json({ exists: true });
        }else{
            res.json({ exists: false });
        }

       
    } catch (error) {
        console.error('Error checking category existence:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



const checkOfferExists = async (req, res) => {
    try {
      const categoryName = req.params.categoryName;
  
      const existingOffer = await Offer.findOne({ categoryName: categoryName });
      if(existingOffer){
        res.json({ exists: true });
      }else{
        res.json({ exists: false });
      }

    } catch (error) {
      console.error('Error checking offer existence:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };


 //get reffereal
 const refferalWallet=async(req,res)=>{
    try {
        const refferal=await Refferal.findOne()
        res.render('admin/refferal',{refferal})
    } catch (error) {
        console.error('error while rendering the refferal page:',error)
    }
 } 

module.exports={
    categoryOffer,
    addCategoryOffer,
    deleteOffer,
    getCategoryName,
    checkOfferExists,
    refferalWallet
}