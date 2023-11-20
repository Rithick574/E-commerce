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
const bannerController=require('../controllers/bannerController')
const couponController=require('../controllers/CouponController')
const uploadBanner = require('../middleware/bannerMulter');
const offerController=require('../controllers/offerController')
const refferalController=require('../controllers/refferalController')




const uploadFields = [
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
];



// Admin login page
admin.get('/login',adminAuth.adminExist, adminController.adminlogin);

//Admin login Route
admin.post('/login',adminAuth.adminExist, adminController.adminLogged);

// admin dashboard route
admin.get('/dashboard',adminAuth.verifyAdmin, adminController.isAdmin)
admin.get('/count-orders-by-day',adminAuth.verifyAdmin, adminController.getCount)
admin.get('/count-orders-by-month',adminAuth.verifyAdmin, adminController.getCount)
admin.get('/count-orders-by-year',adminAuth.verifyAdmin, adminController.getCount)
admin.get('/latestOrders',adminAuth.verifyAdmin, adminController.getOrdersAndSellers)

//view customer
admin.get('/customers',adminAuth.verifyAdmin,adminController.Customers)

//products
admin.get('/products',adminAuth.verifyAdmin,productController.Products)
admin.get('/addProduct',adminAuth.verifyAdmin,productController.addProduct)
admin.get('/status',adminAuth.verifyAdmin,adminController.status)
admin.get('/block/:id',adminAuth.verifyAdmin,adminController.user_Blocking)

// brand
admin.get('/brands',adminAuth.verifyAdmin,brandController.BrandsList)
admin.get('/addbrand',adminAuth.verifyAdmin,brandController.addBrands)
admin.post('/add-brand',adminAuth.verifyAdmin,brandController.AddBrandss)
admin.get('/deletebrand/:brandId',adminAuth.verifyAdmin,brandController.deleteBrand)
admin.get('/editbrand/:brandId',adminAuth.verifyAdmin,brandController.editBrand)
admin.post('/editbrand/:brandId',adminAuth.verifyAdmin,brandController.updateBrand)

// category
admin.get('/category',adminAuth.verifyAdmin,categoryController.CategoryList)
admin.get('/add-category',adminAuth.verifyAdmin,categoryController.AddCategory)
admin.post('/add-category',adminAuth.verifyAdmin,categoryController.AddCategoryy)
admin.delete('/deletecategory/:categoryId',adminAuth.verifyAdmin,categoryController.deleteCategory)
admin.get('/editcategory/:categoryId',adminAuth.verifyAdmin,categoryController.editCategory)
admin.post('/edit-category/:categoryId', adminAuth.verifyAdmin, categoryController.updateCategory);


//orderlist
admin.get('/orders',adminAuth.verifyAdmin,orderController.OrderList)
admin.put('/orders/updateOrderStatus/:orderId',adminAuth.verifyAdmin,orderController.updateOrderStatus)
admin.get('/orders/details/:orderId',adminAuth.verifyAdmin,orderController.viewOrderDetails)
admin.put('/orders/acceptReturn/:orderId',adminAuth.verifyAdmin,orderController.acceptReturn)
admin.put('/orders/cancelReturn/:orderId',adminAuth.verifyAdmin,orderController.cancelReturn)

//multiple image upload using multer
admin.post("/upload",adminAuth.verifyAdmin, upload.fields(uploadFields),productController.addProductPost);

//edit product,update and soft delete
admin.post('/editProduct/:productId',adminAuth.verifyAdmin, productController.editProduct);
admin.post('/updateProduct/:productId',adminAuth.verifyAdmin,upload.fields(uploadFields), productController.updateProduct);
admin.post('/archiveProduct/:productId',adminAuth.verifyAdmin, productController.archiveProduct);
admin.delete('/delete-image/:id/:index',adminAuth.verifyAdmin, productController.deletesingleImage)

//bannner managemet
admin.get('/bannerManagement',adminAuth.verifyAdmin, bannerController.bannerManagement)
admin.post('/uploadBanner',adminAuth.verifyAdmin, uploadBanner.single('image'), bannerController.uploadBanner)
admin.get('/deleteBanner/:bannerId',adminAuth.verifyAdmin, bannerController.deleteBanner)

//coupon management
admin.get('/couponmanagent',adminAuth.verifyAdmin, couponController.CouponManagement)
admin.post('/addCoupon',adminAuth.verifyAdmin, couponController.addCoupon)
admin.delete('/deleteCoupon/:couponId',adminAuth.verifyAdmin, couponController.deleteCoupon)
admin.get('/editCoupon/:couponId',adminAuth.verifyAdmin, couponController.editcouponget)
admin.post('/edit-coupon/:couponId',adminAuth.verifyAdmin, couponController.editCoupon)

//sales report
admin.post('/download-sales-report',adminAuth.verifyAdmin, productController.genereatesalesReport)

//refferal wallet
admin.get('/refferal',adminAuth.verifyAdmin, offerController.refferalWallet)
admin.post('/updateReferralAmount',adminAuth.verifyAdmin, refferalController.updateReferralAmount)

//category offers
admin.get('/offers',adminAuth.verifyAdmin, offerController.categoryOffer)
admin.post('/addOffer',adminAuth.verifyAdmin, offerController.addCategoryOffer)
admin.delete('/deleteOffer/:offerId',adminAuth.verifyAdmin, offerController.deleteOffer)
admin.get('/checkCategoryExists/:categoryName',adminAuth.verifyAdmin, offerController.getCategoryName)
admin.get('/checkOfferExists/:categoryName',adminAuth.verifyAdmin, offerController.checkOfferExists)

// // Admin logout route
admin.get('/logout', adminController.adminLogout);



module.exports={admin}; 