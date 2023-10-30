const Wishlist = require('../model/wishlistSchema')
const Product = require('../model/productSchema')
const User=require('../model/userSchema')


//add to wishlist
const addtoWishList=async(req,res)=>{
    try {
        const userEmail=req.session.user;
        const user = await User.findOne({ email: userEmail });
        const userId = user._id;
        const {  productId } = req.body;
       
        const existingItem = await Wishlist.findOne({products: productId, user: userId });

        if (existingItem) {
          const Remove = await Wishlist.findByIdAndDelete({_id:existingItem._id});
            res.json({ added: false });
          } else {
            
            const newItem = new Wishlist({ products: [productId], user: userId });
            await newItem.save();
            res.json({ added: true });
        }

    } catch (error) {
        console.error("Error in add to wishlist:", error);
        console.log("error in add to wishlist");
        res.render('error/404')
    }
}


//wishlist
const wishList=async(req,res)=>{
    try {
     const userEmail = req.session.user;
    const user = await User.findOne({ email: userEmail });
    const userId = user._id;
    const wishlist = await Wishlist.find({ user: userId }).populate('products');

    // console.log('Wishlist Items:', wishlist); 
    

    res.render('user/wishlist', {
        username:userEmail,
        wishlist: wishlist,
      });
    } catch (error) {
       console.log("error in view to wishlist");
    }
 }


 const deletefromWishlist=async(req,res)=>{
    try {

        const userEmail=req.session.user;
        const user = await User.findOne({ email: userEmail });
        const userId = user._id;
        const {  productId } = req.body;
        const removewishlist = await Wishlist.findOne({products: productId, user: userId });

        const Remove = await Wishlist.findByIdAndDelete({_id:removewishlist._id});
        res.json({ success:true});

    } catch (error) {
      console.log("error in delete to wishlist"); 
    }
 }
 

 module.exports={
    addtoWishList,
    wishList,
    deletefromWishlist
 }