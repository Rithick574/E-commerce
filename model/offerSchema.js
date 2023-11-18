const mongoose = require("mongoose");

const { Schema } = mongoose;

const OfferSchema = new Schema({
    categoryName: String,
    offerPercentage: Number,
    expiryDate: Date,
    status: {type: String, default: "Active"},
    limit: { type: Number, default: 0 },
})

const offer = mongoose.model('offer',OfferSchema)
module.exports = offer;