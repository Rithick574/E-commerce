const mongoose = require('mongoose');

const { Schema } = mongoose;

const WalletTransactionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    transactionType: {
        type: String, 
        enum: ['credit', 'debit'],
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const WalletTransaction = mongoose.model('WalletTransaction', WalletTransactionSchema);

module.exports = WalletTransaction;
