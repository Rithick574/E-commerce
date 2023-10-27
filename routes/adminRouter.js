const express=require('express')
const session = require("express-session");
const admin = express.Router();
const adminController=require("../controllers/adminController")
const { addProductPost } = require("../controllers/adminController");
const path = require('path');
const crypto=require("crypto");
const adminAuth=require('../middleware/adminAuth')
const productController=require('../controllers/product')
const brandController=require('../controllers/brandController')
const categoryController=require('../controllers/categoryController')
const upload = require('../middleware/multer');
const orderController=require('../controllers/orderController')




const uploadFields = [
  { name: 'main', maxCount: 1 },
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
];




// Admin login page
admin.get('/login',adminAuth.adminExist, adminController.adminlogin);

//Admin login Route
admin.post('/login',adminAuth.adminExist, adminController.adminLogged);

// // Protected admin dashboard route
admin.get('/dashboard',adminAuth.verifyAdmin, adminController.isAdmin)
admin.get('/customers',adminAuth.verifyAdmin,adminController.Customers)


admin.get('/products',adminAuth.verifyAdmin,productController.Products)
admin.get('/addProduct',adminAuth.verifyAdmin,productController.addProduct)
admin.get('/status',adminAuth.verifyAdmin,adminController.status)
admin.get('/block/:id',adminAuth.verifyAdmin,adminController.user_Blocking)

//add brand
admin.get('/brands',adminAuth.verifyAdmin,brandController.BrandsList)
admin.get('/addbrand',adminAuth.verifyAdmin,brandController.addBrands)
admin.post('/add-brand',adminAuth.verifyAdmin,brandController.AddBrandss)

//add category
admin.get('/category',adminAuth.verifyAdmin,categoryController.CategoryList)
admin.get('/add-category',adminAuth.verifyAdmin,categoryController.AddCategory)
admin.post('/add-category',adminAuth.verifyAdmin,categoryController.AddCategoryy)

//orderlist
admin.get('/orders',adminAuth.verifyAdmin,orderController.OrderList)
admin.put('/updateOrderStatus/:orderId',adminAuth.verifyAdmin,orderController.updateOrderStatus)
admin.get('/orders/details/:orderId',adminAuth.verifyAdmin,orderController.viewOrderDetails)

//multiple image upload using multer
admin.post("/upload",adminAuth.verifyAdmin, upload.fields(uploadFields),productController.addProductPost);

//edit product,update and soft delete
admin.post('/editProduct/:productId',adminAuth.verifyAdmin, productController.editProduct);
admin.post('/updateProduct/:productId',adminAuth.verifyAdmin,upload.fields(uploadFields), productController.updateProduct);
admin.post('/archiveProduct/:productId',adminAuth.verifyAdmin, productController.archiveProduct);


// // Admin logout route
admin.get('/logout', adminController.adminLogout);



module.exports={admin}; 