const multer=require('multer')
const path = require('path');
const crypto = require("crypto");



// handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './public/product-images/'); 
    },
    filename: (req, file, cb) => {
      const randomeString = crypto.randomBytes(3).toString("hex");
      const timestamp = Date.now();
      const uniqueFile = `${timestamp}-${randomeString}`;
      cb(null, uniqueFile + ".png");
    },
  });


  const upload = multer({ storage,});  


  module.exports= upload;