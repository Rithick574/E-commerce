require("../config/DBconnection");
const Product = require("../model/productSchema");
const Brands = require("../model/brandSchema");
const Category = require("../model/categorySchema");
const Categories = require("../model/categorySchema");
const { ObjectId } = require("mongodb");
const Wishlist = require("../model/wishlistSchema");
const register = require("../model/userSchema");
const { findByIdAndDelete } = require("../model/adminSchema");
const Order = require("../model/orderSchema");
const pdf = require("../utility/salespdf");
const { format } = require("date-fns");

/////USER/////

//view product
const viewProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const username = req.session.user;
    const productData = await Product.findById(productId);
    const user = await register.findOne({ email: username });
    const userId = user._id;
    const userWishlist = await Wishlist.findOne({ user: userId });
    const wishlist = userWishlist ? userWishlist.products : [];

    res.render("user/viewproduct", {
      product: productData,
      username,
      wishlist,
    });
  } catch (error) {
    res.status(500).send("internal server error");
  }
};

//guest view product
const viewProductGuest = async (req, res) => {
  try {
    const productId = req.params.productId;
    const username = req.session.user;
    const productData = await Product.findById(productId);
    console.log(" guest view productsa");
    res.render("user/guestviewproduct", { product: productData, username });
  } catch (error) {
    res.status(500).send("internal server error");
  }
};

//shop
const ShopProduct = async (req, res) => {
  try {
    const username = req.session.user;
    const user = await register.findOne({ email: username });
    const userId = user._id;
    const page = parseInt(req.query.page) || 1;
    const productsCount = await Product.find().count();
    const pageSize = 5;
    const totalProducts = Math.ceil(productsCount / pageSize);
    const skip = (page - 1) * pageSize;

    const viewallProducts = await Product.find().skip(skip).limit(pageSize);
    const userWishlist = await Wishlist.findOne({ user: userId });
    const wishlist = userWishlist ? userWishlist.products : [];

    const categories = await Category.find();
    const brands = await Brands.find();

    res.render("user/shop", {
      viewallProducts,
      username,
      categories,
      wishlist,
      brands,
      productsCount: totalProducts,
      page: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

//filter by categories
const postFilterProduct = async (req, res) => {
  try {
    const { selectedBrands, selectedCategory, selectedPrice } = req.body;
    const username = req.session.user;
    const user = await register.findOne({ email: username });
    const userId = user._id;
    const brands = await Brands.find({});
    const categories = await Category.find({});
    const page = parseInt(req.query.page) || 1;
    const pageSize = 5;
    const skip = (page - 1) * pageSize;

    const filter = {};

    if (selectedBrands) {
      filter.brandId = selectedBrands;
    }
    if (selectedCategory) {
      console.log(selectedCategory);
      filter.categoryId = selectedCategory;
    }
    if (selectedPrice) {
      const priceValue = parseInt(selectedPrice);
      filter.descountedPrice = { $lte: priceValue };
    }

    const viewallProducts = await Product.find(filter)
      .skip(skip)
      .limit(pageSize);
    const productDataCount = await Product.countDocuments(filter);

    const totalProducts = Math.ceil(productDataCount / pageSize);

    const userWishlist = await Wishlist.findOne({ user: userId });
    const wishlist = userWishlist ? userWishlist.products : [];

    // console.log("productData====",viewallProducts);

    res.render("user/shop", {
      username,
      categories,
      viewallProducts,
      wishlist,
      brands,
      productsCount: totalProducts,
      page: page,
    });
  } catch (error) {
    console.error("Error filtering products :", error);
    res
      .status(500)
      .json({ message: "Internal server error while filtering products." });
  }
};

//search products in shop
const searchProducts = async (req, res) => {
  try {
    const search = req.body.searchAllProduct;
    const username = req.session.user;
    const brands = await Brands.find({});
    const categories = await Category.find({});
    const user = await register.findOne({ email: username });
    const userId = user._id;
    const userWishlist = await Wishlist.findOne({ user: userId });
    const wishlist = userWishlist ? userWishlist.products : [];

    const page = parseInt(req.query.page) || 1;
    const pageSize = 5;
    const skip = (page - 1) * pageSize;

    const productDataCount = await Product.find({
      name: { $regex: "^" + search, $options: "i" },
    }).count();

    const totalProducts = Math.ceil(productDataCount / pageSize);

    const viewallProducts = await Product.find({
      name: { $regex: "^" + search, $options: "i" },
    })
      .skip(skip)
      .limit(pageSize);

    res.render("user/shop", {
      username,
      categories,
      viewallProducts,
      wishlist,
      brands,
      productsCount: totalProducts,
      page: page,
    });
  } catch (error) {
    console.log("error while searching", error);
    res.render("error/404");
  }
};

//shop for guest
// const ShopProductGuest=async(req,res)=>{
//    try{
//      const username =req.session.user;
//      const viewallProducts = await Product.find();
//      res.render('user/shop', { viewallProducts,username});

//    }catch(error){
//      console.error(error);
//          res.status(500).send('Internal Server Error');
//    }
//  }

/////ADMIN/////

//products
const Products = async (req, res) => {
  try {
    const products = await Product.find();
    res.render("admin/products", { products: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//add products
const addProduct = async (req, res) => {
  try {
    const categories = await Category.find();
    const brands = await Brands.find();
    res.render("admin/addProducts", { categories, brands, errorMessage: "" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//add product post
const addProductPost = async (req, res) => {
  try {
    const { image1, image2, image3, image4 } = req.files;

    const updatedImages = {
      mainimage: image1 && image1[0] ? image1[0].filename : "",
      image1: image2 && image2[0] ? image2[0].filename : "",
      image2: image3 && image3[0] ? image3[0].filename : "",
      image3: image4 && image4[0] ? image4[0].filename : "",
    };

    let {
      productname,
      price,
      discountprice,
      brand,
      category,
      description,
      stock,
      Spec1,
      Spec2,
      Spec3,
      Spec4,
    } = req.body;

    productname = productname.trim();
    description = description.trim();
    Spec1 = Spec1.trim();
    Spec2 = Spec2.trim();
    Spec3 = Spec3.trim();
    Spec4 = Spec4.trim();

    let categoryId = await Category.find({ name: category });
    let brandId = await Brands.findOne({ name: brand });

    if (parseFloat(discountprice) >= parseFloat(price)) {
      const errorMessage = "Discount price must be less than the base price.";
      const categories = await Category.find();
      const brands = await Brands.find();
      return res.render("admin/addProducts", {
        categories,
        brands,
        errorMessage: errorMessage,
      });
    }

    const data = {
      name: productname,
      images: [updatedImages],
      description: description,
      stock: stock,
      basePrice: price,
      descountedPrice: discountprice,
      timeStamp: Date.now(),
      brandId: new ObjectId(brandId._id),
      categoryId: new ObjectId(categoryId._id),
      highlight1: Spec1,
      highlight2: Spec2,
      highlight3: Spec3,
      highlight4: Spec4,
    };
    const insert = await Product.insertMany([data]);
    res.redirect("/admin/products");
  } catch (err) {
    console.log("error found" + err);
  }
};

//editproduct
const editProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    const brands = await Brands.find();
    const categories = await Category.find();
    res.render("admin/updateProduct", {
      product,
      brands,
      categories,
      errorMessage: "",
    });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

//update product

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    let {
      productname,
      price,
      discountprice,
      brand,
      category,
      description,
      stock,
      Spec1,
      Spec2,
      Spec3,
      Spec4,
    } = req.body;

    productname = productname.trim();
    description = description.trim();
    Spec1 = Spec1.trim();
    Spec2 = Spec2.trim();
    Spec3 = Spec3.trim();
    Spec4 = Spec4.trim();

    const { image1, image2, image3, image4 } = req.files;

    const existingProduct = await Product.findById({ _id: productId });
    const existingImages = existingProduct.images[0];

    if (!existingProduct) {
      return res.status(404).send("Product not found");
    }

    const updatedImages = {
      mainimage:
        image1 && image1[0] ? image1[0].filename : existingImages.mainimage,
      image1: image2 && image2[0] ? image2[0].filename : existingImages.image1,
      image2: image3 && image3[0] ? image3[0].filename : existingImages.image2,
      image3: image4 && image4[0] ? image4[0].filename : existingImages.image3,
    };

    const categoryId = await Categories.findOne({ name: category });
    const brandId = await Brands.findOne({ name: brand });

    if (isNaN(price) || isNaN(discountprice) || isNaN(stock)) {
      return res
        .status(400)
        .send("Invalid numeric values for price, discount price, or stock");
    }

    if (!categoryId || !brandId) {
      return res.status(404).send("Category or brand not found");
    }

    if (parseFloat(discountprice) >= parseFloat(price)) {
      const brands = await Brands.find();
      const categories = await Categories.find();
      const errorMessage = "Discount price must be less than the base price.";
      return res.render("admin/updateProduct", {
        product: existingProduct,
        brands,
        categories,
        errorMessage,
      });
    }

    const updatedProductData = {
      name: productname,
      basePrice: price,
      description: description,
      brandId: brandId._id,
      categoryId: categoryId._id,
      stock: stock,
      descountedPrice: discountprice,
      highlight1: Spec1,
      highlight2: Spec2,
      highlight3: Spec3,
      highlight4: Spec4,
      $set: {
        images: [updatedImages],
        timeStamp: Date.now(),
      },
    };

    await Product.updateOne({ _id: productId }, updatedProductData);

    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
    res.render("error/admin404");
  }
};

//archieve product(dsoft delete)
const archiveProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Toggle the isDeleted field
    product.isDeleted = !product.isDeleted;

    // Save the updated product
    await product.save();

    if (product.isDeleted) {
      console.log("Product has been soft-deleted");
    } else {
      console.log("Product has been restored");
    }

    res.redirect("/admin/products");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

//generate sales report in pdf
const genereatesalesReport = async (req, res) => {
  try {
    console.log(req.body);
    const startDate = req.body.startDate;
    const format = req.body.downloadFormat;
    const endDate = new Date(req.body.endDate);
    endDate.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      PaymentStatus: "Paid",
      OrderDate: {
        $gte: startDate,
        $lte: endDate,
      },
    }).populate("Items.productId");
    

    let totalSales = 0;

    orders.forEach((order) => {
      totalSales += order.TotalPrice || 0;
    });
    

    pdf.downloadReport(
      req,
      res,
      orders,
      startDate,
      endDate,
      totalSales.toFixed(2),
      format
    );
  } catch (error) {
    console.log("Error while generating sales report pdf:", error);
    res.status(500).send("Internal Server Error");
  }
};

//delete single image
const deletesingleImage = async (req, res) => {
  try {
    const productId = req.params.id;
    const imageIndex = req.params.index;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    let imageField = "";
    let deletedImage = "";

    if (imageIndex === "0") {
      imageField = "images.0.mainimage";
      deletedImage = product.images[0].mainimage;
    } else if (imageIndex === "1") {
      imageField = "images.0.image1";
      deletedImage = product.images[0].image1;
    } else if (imageIndex === "2") {
      imageField = "images.0.image2";
      deletedImage = product.images[0].image2;
    } else if (imageIndex === "3") {
      imageField = "images.0.image3";
      deletedImage = product.images[0].image3;
    } else {
      return res.status(404).send("Image not found");
    }

    await Product.updateOne(
      { _id: productId },
      { $unset: { [imageField]: 1 } }
    );

    return res.status(200).send(`Image '${deletedImage}' deleted successfully`);
  } catch (error) {
    console.error("Error while deleting the product image:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  viewProduct,
  ShopProduct,
  viewProductGuest,
  // ShopProductGuest,
  Products,
  addProduct,
  addProductPost,
  editProduct,
  updateProduct,
  archiveProduct,
  genereatesalesReport,
  deletesingleImage,
  postFilterProduct,
  searchProducts,
};
