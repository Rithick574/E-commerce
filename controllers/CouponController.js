require('../config/DBconnection')

const { findOne } = require('../model/adminSchema')
const Coupon=require('../model/couponSchema')
const User=require('../model/userSchema')


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


//delete coupon
const deleteCoupon=async(req,res)=>{
  const couponId = req.params.couponId;
  try {
    
    await Coupon.findByIdAndRemove(couponId);

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting coupon:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}



//apply coupon and check coupon
const applyCoupon = async (req, res) => {
  try {
    const email = req.session.user;
    const code = req.body.couponCode;
    const total = req.body.total;
    let discount = 0;

    // Find the user by email
    const user = await User.findOne({ email });
    const userId = user._id;

    // Find the coupon by code
    const couponMatch = await Coupon.findOne({ couponCode: code });

    if (couponMatch) {
      // Check if the coupon is active
      if (couponMatch.status === true) {
        const currentDate = new Date();
        const startDate = couponMatch.startDate;
        const endDate = couponMatch.endDate;

        // Check if the current date is within the coupon validity period
        if (startDate <= currentDate && currentDate <= endDate) {
          // Check coupon type
          if (couponMatch.couponType === "public" || (couponMatch.couponType === "private" && couponMatch.userIds.includes(userId))) {
            // Check if the coupon usage limit is reached
            if (couponMatch.limit === 0 || couponMatch.limit > 0) {
              // Check if the user has already used the coupon
              const couponUsed = await Coupon.findOne({
                couponCode: couponMatch.couponCode,
                "usedBy.userId": userId,
              });

              if (couponUsed) {
                return res.json({ error: "You have used the coupon once" });
              } else {
                // Apply the discount based on coupon type
                if (couponMatch.discountType === "fixed") {
                  if (total >= couponMatch.minAmountFixed) {
                    discount = couponMatch.amount;
                  } else {
                    return res.json({
                      error: `Cart should contain a minimum amount of ${couponMatch.minAmountFixed}`,
                    });
                  }
                } else {
                  if (total >= couponMatch.minAmount) {
                    discount = total * (couponMatch.minAmount / 100);
                  } else {
                    return res.json({
                      error: `Cart should contain a minimum amount of ${couponMatch.minAmount}`,
                    });
                  }
                }

                // Update user's grand total and save the coupon usage
                req.session.grandTotal = total - discount;

                // Save coupon usage
                couponMatch.usedBy.push({
                  userId: userId,
                  usedAt: new Date(),
                });

                await couponMatch.save();

                // Respond with success and updated information
                return res.status(200).json({ success: true, discount, grandTotal: req.session.grandTotal });
              }
            } else {
              return res.json({ error: "Coupon limit reached" });
            }
          } else {
            return res.json({ error: "Coupon is not applicable to the user" });
          }
        } else {
          return res.json({ error: "Coupon is expired" });
        }
      } else {
        return res.json({ error: "Coupon is not active" });
      }
    } else {
      return res.json({ error: "No such coupon found" });
    }
  } catch (error) {
    console.error(error);
    res.json({ error: "Some error occurred" });
  }
};


const editcouponget=async(req,res)=>{
  try {
    const couponId = req.params.couponId;
    const coupon = await Coupon.findById(couponId);
    res.render('admin/editCoupon', { coupon });
  } catch (error) {
    console.error("error while rendering the edit coupon page");
  }
}



const editCoupon=async(req,res)=>{
  try {
    const { couponName, couponCode, discountType, minAmount, maxAmount, minAmountFixed, limit, couponType, startDate, endDate } = req.body;
    const coupon=await Coupon.findById(req.params.couponId)
    let amount=0
    if(discountType== 'percentage'){
     amount = Array.isArray(req.body.amount) ? req.body.amount[0] : req.body.amount;
   
    }else if(discountType== 'fixed'){
       amount = Array.isArray(req.body.amount) ? req.body.amount[1] : req.body.amount;
     
    }
    
    coupon.couponName = couponName;
    coupon.couponCode = couponCode;
    coupon.discountType = discountType;
    coupon.amount = amount;
    coupon.minAmount = minAmount;
    coupon.maxAmount = maxAmount;
    coupon.minAmountFixed = minAmountFixed;
    coupon.limit = limit;
    coupon.couponType = couponType;
    coupon.startDate = startDate;
    coupon.endDate = endDate;

    await coupon.save();
    res.redirect('/admin/couponmanagent');

  } catch (error) {
    console.error("error while editing the coupon:",error)
  }
}


module.exports={
    CouponManagement,
    addCoupon,
    deleteCoupon,
    applyCoupon,
    editcouponget,
    editCoupon
}