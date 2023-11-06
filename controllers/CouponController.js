require('../config/DBconnection')

const { findOne } = require('../model/adminSchema')
const Coupon=require('../model/couponSchema')


const CouponManagement=async(req,res)=>{
try {
    const coupons=await Coupon.find()
    const date = new Date()
    res.render('admin/couponManagement', { coupons,date })
} catch (error) {
    console.log("error while rendering the show coupon page:",error);
    res.render('admin/couponManagement', { coupons: [] });
}
}

const addCoupon=async(req,res)=>{
   
    try {
       
        if (req.body.discountType === "fixed") {
          req.body.amount = req.body.amount[1];
        } else if (req.body.discountType === "percentage") {
          req.body.amount = req.body.amount[0];
        }
        const exist=await Coupon.findOne({couponCode:req.body.couponCode})
        if(exist){
            return res.json({error:"Coupon already exist!!"})
        }
        const coupon = await Coupon.create(req.body);
        if (coupon) {
          console.log("added to collection");
          res.json({ success: true });
        } else {
          console.log("not added to collection");
          res.json({ error: "COUPON already consist" });
        }
        
    } catch (error) {
        console.log("error while add coupon",error);
    }
}


module.exports={
    CouponManagement,
    addCoupon
}