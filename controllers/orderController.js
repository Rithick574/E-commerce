require('../config/DBconnection')
const User=require('../model/userSchema')
const Cart=require('../model/cartSchema')
const Order = require("../model/orderSchema");
const Product=require('../model/productSchema')
const moment = require('moment');
const easyinvoice = require('easyinvoice');
const razorpay = require("../utility/razorpay");
const mongoose = require("mongoose");
const crypto = require('crypto');






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
        

        const PaymentMethod = req.body.paymentMethod;
    
        const Address = req.body.Address;
     
        const Email=req.session.user
        
        const amount = req.session.totalPrice;
      
        const user = await User.findOne({ email: Email });
        const userid = user._id;
        

        const cart = await Cart.findOne({ userId: userid }).populate("products.productId");
        // console.log(cart+"!!!!!!!!!!!");




        if (!cart) {
            console.error("No cart found for the user.");
        //    console.log("hello world");
            return res.render('error/404');
          }

          const address = await User.findOne({
            _id:userid,
            Address:{
              $elemMatch:{_id: new mongoose.Types.ObjectId(Address)} 
            }
          })

        //   console.log("address====",address); 
        //   console.log("add====",address.Address[0].AddressLane,)


          const add = {
            Name: address.Address[0].Name,
            Address:  address.Address[0].AddressLane,
            Pincode: address.Address[0].Pincode,
            City: address.Address[0].City,
            State: address.Address[0].State,
            Mobile:  address.Address[0].Mobile,
          }

          const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }); 

        const newOrders = new Order({
            UserId: userid,
            Items: cart.products,
            OrderDate: currentDate,
            ExpectedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
            TotalPrice: req.session.totalPrice,
            Address: add,
            PaymentMethod: PaymentMethod,
          });

          // console.log(newOrders.Items);

          const order = await newOrders.save();

          await Cart.findByIdAndDelete(cart._id);

         
          // console.log(order, "in orders");
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
            res.json({ codSuccess: true });
          }else {
         
            const order = {
              amount: amount,
              currency: "INR",
              receipt: req.session.orderId,
            };
            await razorpay
              .createRazorpayOrder(order)
              .then((createdOrder) => {
                console.log("payment response", createdOrder);
                res.json({ createdOrder, order });
              })
              .catch((err) => {
                console.log(err);
              });
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
        .sort({ OrderDate: -1 })
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


const OrderList = async (req, res) => {
  try {
    const perPage = 5; 

    const page = parseInt(req.query.page) || 1;
    const totalOrders = await Order.find().count();
    // console.log(totalOrders);
    const totalProducts = Math.ceil(totalOrders / perPage);
    // console.log(totalProducts);
    const skip = (page - 1) * perPage;
    // console.log(skip);
    const orders = await Order.find().sort({ OrderDate: -1 }).skip(skip).limit(perPage).exec();
    // console.log(orders);

    res.render('admin/orders', {
      order: orders,
      current: page,
      pages: totalProducts
    });
  } catch (error) {
    console.error(error);
    res.render('error/admin404');
  }
};


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

        const user = await User.findById(orders.UserId);

        const orderedProducts = orders.Items;

        let customerOrderTotal = 0;
        orderedProducts.forEach((product) => {
            customerOrderTotal += product.productId.descountedPrice * product.quantity;
        });
        
        res.render('admin/orderviewproduct', {
           orderedProducts: orders.Items ,
           customerName: user.Address[0].Name,
           customerAddress: user.Address[0],
           customerOrderTotal: customerOrderTotal
          });
      
      } catch (error) {
        console.log('Error viewing ordered products:', error);
     
      }
      }

const orderSuccess=(req,res)=>{
    const username = req.session.user
    res.render('user/orderSuccess',{username})  
}
  

const verifyPayment=async(req,res)=>{
  try {
    
    let hmac = crypto.createHmac("sha256", process.env.KEY_SECRET);
    console.log(
      req.body.payment.razorpay_order_id +
        "|" +
        req.body.payment.razorpay_payment_id
    );
    hmac.update(
      req.body.payment.razorpay_order_id +
        "|" +
        req.body.payment.razorpay_payment_id
    );

    hmac = hmac.digest("hex");
    if (hmac === req.body.payment.razorpay_signature) {
      const orderId = new mongoose.Types.ObjectId(
        req.body.order.createdOrder.receipt
      );
      console.log("reciept", req.body.order.createdOrder.receipt);
      const updateOrderDocument = await Order.findByIdAndUpdate(orderId, {
        PaymentStatus: "Paid",
        PaymentMethod: "Online",
      });
      // console.log("hmac success");
      res.json({ success: true });
    } else {
      // console.log("hmac failed");
      res.json({ failure: true });
    }

  } catch (error) {
    console.error("failed to verify the payment",error);
  }
}

module.exports={
    PlaceOrder,
    addAddress,
    postCheckout,
    orderHistory,
    OrderList,
    updateOrderStatus,
    viewOrderDetails,
    orderSuccess,
    verifyPayment
}