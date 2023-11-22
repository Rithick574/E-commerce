const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;



const ShippedAddressSchema = new Schema({
  Name: { type: String, required: true },
  Address: { type: String, required: true },
  Pincode: { type: String, required: true },
  City: { type: String, required: true },
  State: { type: String, required: true },
  Mobile: { type: Number, required: true },
});

const ReturnRequestSchema = new Schema({
  reason: { type: String, required: true },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});


const OrdersSchema = new Schema({
  UserId: { type: Schema.Types.ObjectId, ref: "users" },
  Status: { type: String, default:"Order Placed"},
  Items: [{
     productId: { type: Schema.Types.ObjectId , ref: "products" },
     quantity: { type: Number },
  }],
  PaymentMethod: {type: String},
  OrderDate: { type: Date, required: true },
  ExpectedDeliveryDate:{type: Date, required: true},
  TotalPrice: { type: Number },
  PaymentStatus: {type: String, default: "Pending"},
  CouponId: { type: Schema.Types.ObjectId },
  Address: { type: ShippedAddressSchema },
  ReturnRequest: { type: ReturnRequestSchema },
});

const Orders = mongoose.model('Orders', OrdersSchema);

module.exports = Orders
