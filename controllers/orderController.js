require('../config/DBconnection')
const User=require('../model/userSchema')
const Cart=require('../model/cartSchema')
const Order = require("../model/orderSchema");
const Product=require('../model/productSchema')
const moment = require('moment');





const PlaceOrder=async(req,res)=>{
    const email = req.session.user;
    const user = await User.findOne({ email: email });
res.render('user/checkout', {username: email, user: user})
}



//add address
const addAddress=async(req,res)=>{
    try{

        const addressData = {
            Name: req.body.Name,
            AddressLane: req.body.Address,
            City: req.body.City,
            Pincode: req.body.Pincode,
            State: req.body.State,
            Mobile: req.body.Mobile,
        };

        const userEmail = req.session.user;

        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.render('user/404');
        }

        user.Address.push(addressData);
        await user.save();
        return res.redirect('/placeorder');

    } catch (error) {
        console.error(error);
        res.render('error/404');
    }
};



//order placing 
const  postCheckout=async(req,res)=>{
    try {
        // console.log("inside body", req.body);

        const PaymentMethod = req.body.paymentMethod;
    
        const Address = req.body.Address;
     
        const Email=req.session.user
        
        
        const amount = req.session.totalPrice;
      
        const user = await User.findOne({ email: Email });
        const userid = user._id;
        

        const cart = await Cart.findOne({ userId: userid }).populate("products.productId");
        console.log(cart+"!!!!!!!!!!!");


        if (!cart) {
            console.error("No cart found for the user.");
           console.log("hello world");
            return res.render('error/404');
          }

        const newOrders = new Order({
            UserId: userid,
            Items: cart.products,
            OrderDate: moment(new Date()).format("llll"),
            ExpectedDeliveryDate: moment().add(4, "days").format("llll"),
            TotalPrice: req.session.totalPrice,
            Address: Address,
            PaymentMethod: PaymentMethod,
          });

          console.log(newOrders.Items);

          const order = await newOrders.save();

          await Cart.findByIdAndDelete(cart._id);

         
          console.log(order, "in orders");
          req.session.orderId = order._id;

          for (const item of order.Items) {
            const productId = item.productId;
            const quantity = item.quantity;

            const product = await Product.findById(productId);

            if (product) {
                const updatedQuantity = product.stock - quantity;
        
                if (updatedQuantity < 0) {
                  product.stock = 0;
                  product.Status = "Out of Stock";
                } else {
            
                  product.stock = updatedQuantity;
        
                 
                  await product.save();  
                }
              }

          }
          if (PaymentMethod === "cod") {
            res.render('user/orderSuccess')
          }

       
      } catch (error) {
        console.error('Error placing order:', error);
       res.render('error/404')
      }
}


//order history
const orderHistory=async(req,res)=>{
    try {
        const username=req.session.user
        const user = await User.findOne({ email: username });
        const userid = user._id;
      
        const orders = await Order.find({ UserId: userid })
        .sort({ orderDate: -1 })
        .populate(
            'Items.productId'
        );
    
        // console.log('Orders:', orders);
        if (orders.length === 0) {
            return res.render('user/orderHistory', { username ,orders:[]});
          } else {
            res.render('user/orderHistory', { 
                username, 
                orders: orders 
            });
          }
    } catch (error) {
        console.log("error in track order");
        res.render('error/404')
    }
}



//////////////Admin///////////////////

const OrderList=async(req,res)=>{
    try {
        const Orders= await Order.find();
        res.render('admin/orders',{ order:Orders })
    } catch (error) {
        console.error(error);
        res.render('error/admin404');
    }
}

const updateOrderStatus=async(req,res)=>{
    try {
        const orderId = req.params.orderId;
      
        const newStatus = req.body.status;
    
        await Order.findByIdAndUpdate(orderId, { Status: newStatus });
    } catch (error) {
       
        console.error('Error updating order status:', error);
        res.json({ success: false });
    }
}


const viewOrderDetails=async(req,res)=>{
    try {
      
        const orderId = req.params.orderId;
        const orders = await Order.findById(orderId).populate('Items.productId');
        if (!orders) {
            return res.render('error/admin404'); 
        }
        
        res.render('admin/orderviewproduct', { orderedProducts: orders.Items });
      
      } catch (error) {
        console.log('Error viewing ordered products:', error);
     
      }
      }


  

module.exports={
    PlaceOrder,
    addAddress,
    postCheckout,
    orderHistory,
    OrderList,
    updateOrderStatus,
    viewOrderDetails
}