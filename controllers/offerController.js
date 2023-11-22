require('../config/DBconnection')
const Offer=require('../model/offerSchema')
const Category=require('../model/categorySchema')
const products=require('../model/productSchema')
const Refferal=require('../model/referralSchema')


//get category offer
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

        const fetchCategoryId = await Category.findOne({ name: categoryName });

        if (!fetchCategoryId) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const categoryId = fetchCategoryId._id;
       

        const productsBeforeOffer = await products.find({ categoryId });

        for (const product of productsBeforeOffer) {
            const discountPrice = product.descountedPrice;

            await products.updateOne(
                { _id: product._id },
                { $set: { 
                    beforeOffer: discountPrice,
                    IsInCategoryOffer: true,
                    categoryOffer: { offerPercentage: offerPercentage }
                 } }
            );
        }

        const offerMultiplier = 1 - offerPercentage / 100;

      
        const productData = await products.updateMany(
            { categoryId },
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

        const deletedOffer = await Offer.findById(offerId);
        if (!deletedOffer) {
            return res.status(404).json({ error: 'Offer not found' });
        }

        const { categoryName } = deletedOffer;

        const fetchCategoryId = await Category.findOne({ name: categoryName });
        if (!fetchCategoryId) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const categoryId = fetchCategoryId._id;

        const productsBeforeOffer = await products.find({ categoryId });

         for (const product of productsBeforeOffer) {
            const oldPrice = product.beforeOffer || 0; 
            await products.updateOne(
                { _id: product._id },
                { $set: { 
                    descountedPrice: oldPrice,
                    IsInCategoryOffer: false,
                    categoryOffer: { offerPercentage: undefined }
                 } }
            );
        }

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

 //edit category Offer
 const EditOffer=async(req,res)=>{
    try {
        const categoryId= req.params.categoryId;
        const offer= await Offer.findOne({_id: categoryId})
        res.render('admin/editOffer',{offer})
    } catch (error) {
        console.error('error while editing category offer:',error)
    }
 }



 // Update offer
const updateOffer = async (req, res) => {
    try {
        const { offerPercentage, expiryDate } = req.body;
        let categoryId = req.params.offerId;

        const existingOffer = await Offer.findById(categoryId);

        if (!existingOffer) {
            return res.status(404).json({ error: 'Offer not found' });
        }

     
        existingOffer.offerPercentage = offerPercentage;
        existingOffer.expiryDate = expiryDate;
        await existingOffer.save();

     
        const fetchCategoryId = await Category.findOne({ name: existingOffer.categoryName });
        if (!fetchCategoryId) {
            return res.status(404).json({ error: 'Category not found' });
        }

        categoryId = fetchCategoryId._id;

      
        const productsBeforeOffer = await products.find({ categoryId });
        
        for (const product of productsBeforeOffer) {
            const discountPrice = product.beforeOffer || 0; 

            const offerMultiplier = 1 - offerPercentage / 100;
            const newDiscountedPrice = Math.floor(offerMultiplier * discountPrice);

            await products.updateOne(
                { _id: product._id },
                { $set: {
                     descountedPrice: newDiscountedPrice,
                     IsInCategoryOffer: true,
                     categoryOffer: offerPercentage
                     } }
            );
        }

        res.redirect('/admin/offers');

    } catch (error) {
        console.error('Error while updating the category offer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports={
    categoryOffer,
    addCategoryOffer,
    deleteOffer,
    getCategoryName,
    checkOfferExists,
    refferalWallet,
    EditOffer,
    updateOffer
}