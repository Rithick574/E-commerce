const mongoose = require('mongoose');
const connection=require("../config/DBconnection")



const { Schema, ObjectId } = mongoose;
const imageSchema = new mongoose.Schema({
  mainimage: {
    type: String,
  },
});
const CategoriesSchema = new Schema({
  name: { type: String, required: true },
  images: [imageSchema],
  timeStamp: { type: Date },
});

const Categories = mongoose.model('Categories', CategoriesSchema);

module.exports=Categories;



