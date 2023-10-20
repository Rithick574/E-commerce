require('../config/DBconnection');
const Cart = require('../model/cartSchema');
const User= require('../model/userSchema')
const {ObjectId}=require("mongodb")
const product=require('../model/productSchema')


//view cart
const viewCart=async(req,res)=>{
    try{
        const email = req.session.user;
        // console.log(email);
        const user = await User.findOne({ email: email });

        if (!user) {
           
            return res.status(404).render('error/404');
        }

        // console.log("user" + user._id);
      const userId = user._id;
    

      const cart = await Cart.findOne({ userId: userId }).populate("products.productId" ); 


      const product = cart.products;
      // console.log(product, "==============k==============");
      // console.log(product[0].productId, "=============l===============");
      // console.log(product);


      let subtotal = 0;
      let totalQuantity = 0;

      cart.products.forEach(item => {
        subtotal += item.quantity * item.productId.descountedPrice;
        totalQuantity += item.quantity;
      });

      const gstRate = 0.12; 
    const gstAmount = subtotal * gstRate;
    const coupon = '';
    const total = subtotal + gstAmount;

    if (coupon) {
      const couponValue = 50;
      total -= couponValue;
    }

    res.render("user/cart", {
      username: user,
      product: cart.products,
      cart,
      subtotal: subtotal,
      gstAmount: gstAmount.toFixed(2),
      totalQuantity:totalQuantity,
      coupon: coupon,
      total: total,
    });
  
    }catch(error){
        console.log("error in view cart");
        res.render('error/404')
    }
}





// Add to cart
const addToCart = async (req, res) => {
  try {
    const userEmail = req.session.user;
    // console.log(userEmail);
    const user = await User.findOne({ email: userEmail });
    
    // console.log("user" + user._id);
    const userId = user._id;
   
    const productId= req.params.productId;

    // console.log(productId);

    const check = await Cart.findOne({ userId: userId });

    // console.log(check+"erkk");

    if (check !== null) {
        // console.log("if");

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
        res.json({ success: true, message: "Item added to the cart" });
      } else {
        // console.log("else");
        const newCart = new Cart({
          userId: userId,
          products: [{ productId: new ObjectId(productId), quantity: 1 }],
        });
        // console.log(newCart);
        await newCart.save();
        res.json({ success: true, message: "Item added to the cart" });
        req.flash("msg", "Item added to the cart");
        // res.redirect("/");
      }
    } catch (err) {
      console.log(
        err,
        "cart error"
      );
      res.status(500).json({ success: false, error: "Failed to add product to the cart" });
      req.flash("errmsg", "sorry at this momment we can't reach");
      res.render('error/404')
    }
  }



   //update quantity
   const updateQuantity=async(req,res)=>{
    const { productId, quantity,cartId } = req.body;
    console.log(productId);
    console.log(quantity);
    console.log(cartId);
    try{

      const cart = await Cart.findOne({ _id: cartId }).populate("products.productId" )

      if (!cart) {
        return res.status(404).json({ success: false, error: "Cart not found" });
      }
      const productInCart = cart.products.find(item => item.productId.equals(productId));
  
      if (!productInCart) {
        return res.status(404).json({ success: false, error: "Product not found in the cart" });
      }
      productInCart.quantity = quantity;
  
      await cart.save();
  
      let subtotal = 0;
      let totalQuantity = 0;
      cart.products.forEach((item) => {
        console.log(item,"isinde for each");
      subtotal += item.quantity * item.productId.descountedPrice;
      totalQuantity += item.quantity;
    });
    console.log(subtotal);

    const gstRate = 0.12;
    const gstAmount = subtotal * gstRate;
    const coupon = ''; 
    let total = subtotal + gstAmount;

    if (coupon) {
      const couponValue = 50; 
      total -= couponValue;
    }

    res.json({
      success: true,
      subtotal: subtotal,
      gstAmount: gstAmount,
      totalQuantity: totalQuantity,
      coupon: coupon,
      total: total,
    });

    }catch (error) {
      console.error('Error updating stock quantity:', error);
      res.status(500).json({ success: false, error: "Failed to  update stock quantity" });
    }
  }




//remove cart
const removeFromCart=async(req,res)=>{
try{
  const { productId, cartId } = req.body;
  const cart = await Cart.findById(cartId);
  if (!cart) {
    return res.status(404).json({ success: false, error: "Cart not found" });
  }
  cart.products = cart.products.filter((item) => !item.productId.equals(productId));
  await cart.save();
  res.json({ success: true });

}catch(error){
  console.error('Error removing product from the cart:', error);
  res.status(500).json({ success: false, error: "Failed to remove product from the cart" });
}
}




//get quantity for the add to cart
const getQuantity=async(req,res)=>{
  try {
    const email = req.session.user;
    const user = await User.findOne({ email: email });

    if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
    }

    const userId = user._id;

    const cart = await Cart.findOne({ userId: userId });

    if (!cart) {
        return res.json({ success: true, quantity: 0 }); 

    const totalQuantity = cart.calculateTotalQuantity();

    res.json({ success: true, quantity: totalQuantity });
}} catch(error) {
    console.error('Error fetching cart quantity:', error);
    res.status(500).json({ success: false, error: "Failed to fetch cart quantity" });
}
  
}



module.exports = {
  addToCart,
  viewCart,
  updateQuantity,
  removeFromCart,
  getQuantity,
};
