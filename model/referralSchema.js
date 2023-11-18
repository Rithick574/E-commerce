// referralSchema.js

const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema({
  amount: { type: Number, default: 0 },
});


 const Referral= mongoose.model('Referral', ReferralSchema);
 module.exports =Referral