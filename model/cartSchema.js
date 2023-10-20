const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const CartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId },
  products: [{
    productId: { type: Schema.Types.ObjectId, ref: 'products'},
    quantity: { type: Number },
    
  }],
  TotalAmount: { type: Number },
});


CartSchema.methods.calculateTotalQuantity = function () {
  let totalQuantity = 0;
  this.products.forEach(item => {
      totalQuantity += item.quantity;
  });
  return totalQuantity;
};


const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart 