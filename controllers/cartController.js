require('../config/DBconnection');
const Cart = require('../model/cartSchema');
const User= require('../model/userSchema')
const {ObjectId}=require("mongodb")
const product=require('../model/productSchema')


//view cart
const viewCart=async(req,res)=>{
    try{
        const email = req.session.user;
        console.log(email);
        const user = await User.findOne({ email: email });

        if (!user) {
           
            return res.status(404).render('error/404');
        }

        console.log("user" + user._id);
      const userId = user._id;
    

      const cart = await Cart.findOne({ userId: userId }).populate("products.productId" ); 


      const product = cart.products;
      console.log(product, "==============k==============");
      console.log(product[0].productId, "=============l===============");
      console.log(product);

      res.render("user/cart", {  username: user, product });
    }catch(error){
        console.log("error");
        res.render('error/404')
    }
}





// Add to cart
const addToCart = async (req, res) => {
  try {
    const userEmail = req.session.user;
    console.log(userEmail);
    const user = await User.findOne({ email: userEmail });
    
    console.log("user" + user._id);
    const userId = user._id;
   
    const productId=req.params.productId;

    console.log(productId);

    const check = await Cart.findOne({ userId: userId });

    console.log(check+"erkk");

    if (check !== null) {
        console.log("if");

        const existingCart = check.products.find((item) =>
        item.productId.equals(productId)
      );
      if (existingCart) {
        existingCart.quantity += 1;
      } else {
        check.products.push({ productId: productId, quantity: 1 });
      }
      await check.save();
      
        req.flash("msg", "Item added to the cart");
        res.redirect("/");
      } else {
        console.log("else");
        const newCart = new Cart({
          userId: userId,
          products: [{ productId: new ObjectId(productId), quantity: 1 }],
        });
        console.log(newCart);
        await newCart.save();
        req.flash("msg", "Item added to the cart");
        res.redirect("/");
      }
    } catch (err) {
      console.log(
        err,
        "cart error"
      );
      req.flash("errmsg", "sorry at this momment we can't reach");
      res.render('error/404')
    }
  }


module.exports = {
  addToCart,
  viewCart
};
