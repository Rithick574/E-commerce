const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;

const couponSchema = new mongoose.Schema({
    couponName: String,
    couponCode: {
        type: String,
        required: true,
        unique: true 
    },
    usedBy: [
        {
          userId: Schema.Types.ObjectId,
          couponCode: Schema.Types.ObjectId,
          status: {type: String, default: 'Attempted'},
          usedAt:{type: Date,  default: Date.now },
        }
      ],
      discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    amount: Number,
  minAmount: Number,
  minAmountFixed: Number,
  maxAmount: Number,
  limit: Number,
  couponType: String,
  startDate: Date,
  endDate: Date,
  category: Array,
  applyType: String,
  status: { type: Boolean, default: true },
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
