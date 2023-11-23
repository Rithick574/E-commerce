const product = require("../model/productSchema");
const offer = require("../model/offerSchema");
const cron = require("node-cron");
const Category=require('../model/categorySchema')


const checkCategoryOffers = async () => {
  console.log("runningcron.............!!!");
  try {
    const currentDate = new Date();
    const offers = await offer.find({ expiryDate: { $lte: currentDate } });

   if (offers.length > 0) {
      for (const offer of offers) {
        
        const categoryname = await Category.findOne({name: offer.categoryName});
        const categoryId=categoryname._id;
       
        const previousDiscounts = {};
        const productsToUpdate = await product.find({ categoryId: categoryId });

        productsToUpdate.forEach(product => {
          previousDiscounts[product._id] = product.descountedPrice;
        });

        const discountAmounts = offer.offerPercentage;

        const discountAmount=( productsToUpdate.beforeOffer ) * (discountAmounts/100)

       const products = await product.updateMany(
          { categoryId: categoryId },
          { $inc: { descountedPrice: discountAmount },
           $set: {
             IsInCategoryOffer: false,
             categoryOffer: undefined 
             } }
        );
        
        await offer.deleteOne({ _id: offer._id });
        
      }
    }
    
  } catch (error) {
    console.error("Error in the cron job:", error);
    throw error;
  }
};



// cron.schedule("*/200 * * * * *", async () => {
//     try {
//       await checkCategoryOffers();
//     } catch (error) {
//       console.error("Error in cron job:", error);
//     }
//   });
  