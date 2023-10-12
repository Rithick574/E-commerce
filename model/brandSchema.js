const mongoose = require('mongoose');
const connection=require("../config/DBconnection")

const { Schema, ObjectId } = mongoose;
const imageSchema = new mongoose.Schema({
  mainimage: {
    type: String,
  },
});
const BrandsSchema = new Schema({
  name: { type: String },
  images: [imageSchema],
  timeStamp: { type: Date },
});

const Brands = mongoose.model('Brands', BrandsSchema);

module.exports=Brands;

