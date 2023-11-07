const multer = require('multer');
const path = require('path');
const crypto = require("crypto");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/banner-images/');
    },
    filename: (req, file, cb) => {
        const randomString = crypto.randomBytes(3).toString("hex");
        const timestamp = Date.now();
        const uniqueFile = `${timestamp}-${randomString}`;
        cb(null, uniqueFile + ".png"); 
    },
});

const uploadBanner = multer({ storage });

module.exports = uploadBanner;