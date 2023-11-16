const mongoose = require("mongoose");

const { Schema } = mongoose;

const OfferSchema = new Schema({
    categoryName: String,
    offerPrice: Number,
    expiryDate: Date,
    status: {type: String, default: "Active"}
})

const offer = mongoose.model('offer',OfferSchema)
module.exports = offer;