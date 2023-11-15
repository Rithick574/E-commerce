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
  return this.products.reduce((total, product) => total + product.quantity, 0);
};


const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart 
