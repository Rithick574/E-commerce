const mongoose = require("mongoose");


const { Schema, ObjectId } = mongoose;

const imageSchema = new mongoose.Schema({
  mainimage: {
    type: String,
  },
  image1: {
    type: String,
  },
  image2: {
    type: String,
  },
  image3: {
    type: String,
  },
});
const ProductsSchema = new Schema({
  name: { type: String },
  images: [imageSchema],
  description: { type: String },
  highlight1:{ type: String },
  highlight2:{ type: String },
  highlight3:{ type: String },
  highlight4:{ type: String },
  stock: { type: Number },
  basePrice: { type: Number },
  descountedPrice: { type: Number },
  timeStamp: { type: Date },
  brandId: { type: Schema.Types.ObjectId },
  categoryId: { type: Schema.Types.ObjectId },
  isDeleted: { type: Boolean, default: false },
  Status: { type: String },
  IsInCategoryOffer :{
    type:Boolean
  },
  beforeOffer:{ type: Number },
});


const Products = mongoose.model("products", ProductsSchema);

module.exports = Products;
