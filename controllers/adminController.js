const bcrypt = require("bcrypt");
require('../config/DBconnection')
const Admin=require('../model/adminSchema')
const Category = require("../model/categorySchema");
const Brands = require("../model/brandSchema");
const User= require("../model/userSchema")
const Product = require("../model/productSchema");
const multer = require("multer");
const { UserBindingContextImpl } = require("twilio/lib/rest/ipMessaging/v2/service/user/userBinding");
const { ObjectId } = require("mongodb");
const Order=require('../model/orderSchema')
const moment=require("moment")


//get admin login
const adminlogin=(req,res)=>{
    res.render('admin/adminlogin',{ errr: "" })
};



//post admin login
const adminLogged = async (req, res) => {
  try {
    const { email, password } = req.body;
  
    const adminData = await Admin.findOne({ email: email });

    if (!adminData) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, adminData.password);

    if (!isMatch) {
      console.log("Invalid Password");
      const errr1 = "Invalid credentials";
      return res.render("admin/adminlogin", { errr: errr1 });

      return res.status(401).json({ message: "Invalid credentials" });
    } else {
      req.session.logged = true;
      req.session.adminId = adminData._id;
      res.redirect('/admin/dashboard');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};



  //admin logged
  const isAdmin = (req, res) => {
    res.render('admin/adminDash')
  }


  //customers
  const Customers = async (req, res) => {
      try {
        const users = await User.getUsers();
        res.redirect('/admin/status');
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
  };

  

 //block user
 const user_Blocking = async(req,res)=>{
    try{
      const id = req.params.id;
  const blockData = await User.findOne({ _id: id });
  if (blockData.Status == "Active") {
    const blocked = await User.updateOne({ _id: id }, { Status: "Blocked" });
    
  } else if (blockData.Status == "Blocked") {
    const blocked = await User.updateOne({ _id: id }, { Status: "Active" });
   
  }
 
     res.redirect('/admin/status');
  
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    } 

 }


const status = async(req,res) => {
    const pageNum = req.query.page;
  const perPage = 10;
  const users = await User.find()
    .skip((pageNum - 1) * perPage)
    .limit(perPage);
  let i = (pageNum - 1) * perPage;

  res.render("admin/adminCustomer", { title: "admin-user list", users, i });
}



const getCount=async(req,res)=>{
  try {
    const orders = await Order.find({
      Status: {
        $nin:["returned","Cancelled","Rejected"]
      }
    });

    const orderCountsByDay = {};
    const totalAmountByDay = {};
    const orderCountsByMonthYear = {};
    const totalAmountByMonthYear = {};
    const orderCountsByYear = {};
    const totalAmountByYear = {};
    let labelsByCount;
    let labelsByAmount;
   
    orders.forEach((order) => {

      const orderDate = moment(order.OrderDate, "M/D/YYYY, h:mm:ss A");
      const dayMonthYear = orderDate.format("YYYY-MM-DD");
      const monthYear = orderDate.format("YYYY-MM");
      const year = orderDate.format("YYYY");
      
      if (req.url === "/count-orders-by-day") {
       
        if (!orderCountsByDay[dayMonthYear]) {
          orderCountsByDay[dayMonthYear] = 1;
          totalAmountByDay[dayMonthYear] = order.TotalPrice
         
         
        } else {
          orderCountsByDay[dayMonthYear]++;
          totalAmountByDay[dayMonthYear] += order.TotalPrice
        }

        const ordersByDay = Object.keys(orderCountsByDay).map(
          (dayMonthYear) => ({
            _id: dayMonthYear,
            count: orderCountsByDay[dayMonthYear],
          })
        );
     

        const amountsByDay = Object.keys(totalAmountByDay).map(
          (dayMonthYear) => ({
            _id: dayMonthYear,
            total: totalAmountByDay[dayMonthYear],
          })
        );

        

        amountsByDay.sort((a,b)=> (a._id < b._id ? -1 : 1));
        ordersByDay.sort((a, b) => (a._id < b._id ? -1 : 1));

       

        labelsByCount = ordersByDay.map((entry) =>
          moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
        );

        labelsByAmount = amountsByDay.map((entry) =>
          moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
        );

        dataByCount = ordersByDay.map((entry) => entry.count);
        dataByAmount = amountsByDay.map((entry) => entry.total);

       

      } else if (req.url === "/count-orders-by-month") {
        if (!orderCountsByMonthYear[monthYear]) {
          orderCountsByMonthYear[monthYear] = 1;
          totalAmountByMonthYear[monthYear] = order.TotalPrice;
        } else {
          orderCountsByMonthYear[monthYear]++;
          totalAmountByMonthYear[monthYear] += order.TotalPrice;
        }
      
        const ordersByMonth = Object.keys(orderCountsByMonthYear).map(
          (monthYear) => ({
            _id: monthYear,
            count: orderCountsByMonthYear[monthYear],
          })
        );
        const amountsByMonth = Object.keys(totalAmountByMonthYear).map(
          (monthYear) => ({
            _id: monthYear,
            total: totalAmountByMonthYear[monthYear],
          })
        );
       
      
        ordersByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
        amountsByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
      
        labelsByCount = ordersByMonth.map((entry) =>
          moment(entry._id, "YYYY-MM").format("MMM YYYY")
        );
        labelsByAmount = amountsByMonth.map((entry) =>
          moment(entry._id, "YYYY-MM").format("MMM YYYY")
        );
        dataByCount = ordersByMonth.map((entry) => entry.count);
        dataByAmount = amountsByMonth.map((entry) => entry.total);
      } else if (req.url === "/count-orders-by-year") {
        // Count orders by year
        if (!orderCountsByYear[year]) {
          orderCountsByYear[year] = 1;
          totalAmountByYear[year] = order.TotalPrice;
        } else {
          orderCountsByYear[year]++;
          totalAmountByYear[year] += order.TotalPrice;
        }
      
        const ordersByYear = Object.keys(orderCountsByYear).map((year) => ({
          _id: year,
          count: orderCountsByYear[year],
        }));
        const amountsByYear = Object.keys(totalAmountByYear).map((year) => ({
          _id: year,
          total: totalAmountByYear[year],
        }));
      
        ordersByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
        amountsByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
      
        labelsByCount = ordersByYear.map((entry) => entry._id);
        labelsByAmount = amountsByYear.map((entry) => entry._id);
        dataByCount = ordersByYear.map((entry) => entry.count);
        dataByAmount = amountsByYear.map((entry) => entry.total);
      }
    });

    
    res.json({ labelsByCount,labelsByAmount, dataByCount, dataByAmount });
    

  } catch (error) {
    console.error("error while chart loading :",error)
  }
}




const getOrdersAndSellers=async(req,res)=>{
try {
  

  const latestOrders = await Order.find().sort({ _id: -1 }).limit(6);


  const bestSeller = await Order.aggregate([
    {
      $unwind: "$Items",
    },
    {
      $group: {
        _id: "$Items.productId",
        totalCount: { $sum: "$Items.quantity" },
      },
    },
    {
      $sort: {
        totalCount: -1,
      },
    },
    {
      $limit: 6,
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $unwind: "$productDetails",
    },
  ]);
  
  if (!latestOrders || !bestSeller) throw new Error("No Data Found");

  res.json({ latestOrders, bestSeller });


 
} catch (error) {
  console.log("error while fetching the order details in the dashboard",error);
}
}




//admin sighout
const adminLogout=(req,res)=>{
  req.session.destroy();
  res.redirect('/admin/login')
}




module.exports =
 {
    adminlogin,
    adminLogged,
    isAdmin,
    Customers,
    user_Blocking,
    status,
    getOrdersAndSellers,
    getCount,
    adminLogout
 
};