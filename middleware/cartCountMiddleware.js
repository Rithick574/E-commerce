const Cart=require('../model/cartSchema')
const User=require('../model/userSchema')


const calculateCartCount = async (req, res, next) => {
    try {
      const userEmail=req.session.user;
        const user = await User.findOne({ email: userEmail });
        const userId = user._id;
        const userCart = await Cart.findOne({ userId });

    if (userCart) {
     
      let cartCount = 0;
      for (const product of userCart.products) {
        cartCount += product.quantity;
      }

      res.locals.cartCount = cartCount;

    } else {
      res.locals.cartCount = 0; 
    } 
    next();

}catch (error) {
    console.error(error);
    res.locals.cartCount = 0; 
    next();
  }
};
  
  module.exports = calculateCartCount;
  