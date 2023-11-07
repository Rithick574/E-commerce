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
       
        const existingItem = await Wishlist.findOne({ products: productId, user: userId });

        if (existingItem) {
          const Remove = await Wishlist.findOneAndUpdate(
            { user: userId },
            { $pull: { products: productId } },
            { new: true }
        );

            res.json({ added: false });
          } else {
            
            let wishlist = await Wishlist.findOne({ user: userId });

            if (!wishlist) {
              wishlist = new Wishlist({ user: userId, products: [] });
            }

            wishlist.products.push(productId);
            await wishlist.save();
            res.json({ added: true });
             }

    } catch (error) {
        console.error("Error in add to wishlist:", error);
        res.render('error/404')
    }
}


//wishlist
const wishList=async(req,res)=>{
    try {
     const userEmail = req.session.user;
    const user = await User.findOne({ email: userEmail });
    const userId = user._id;
    const wishlist = await Wishlist.findOne({ user: userId }).populate('products');

    // console.log('Wishlist Items:', wishlist); 
    

    if (!wishlist || wishlist.products.length === 0) {
      res.render('user/wishlist', {
        username: userEmail,
        wishlist: [] 
      });
    } else {
      res.render('user/wishlist', {
        username: userEmail,
        wishlist: wishlist
      });
    }
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
       

        const result = await Wishlist.findOneAndUpdate(
          { user: userId },
          { $pull: { products: productId } },
          { new: true }
      );

      if (result) {
          res.json({ success: true });
      } else {
          res.status(404).json({ error: "Product not found in the wishlist" });
      }

    } catch (error) {
      console.log("error in delete to wishlist"); 
    }
 }
 

 module.exports={
    addtoWishList,
    wishList,
    deletefromWishlist
 }