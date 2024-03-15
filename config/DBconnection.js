const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to MongoDB Atlas successfully');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

module.exports = mongoose;
