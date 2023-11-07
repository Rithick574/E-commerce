require('../config/DBconnection')
const Banner = require("../model/bannerSchema");


const bannerManagement=(req,res)=>{

res.render('admin/bannerManagement')

}

const uploadBanner=async(req,res)=>{
    try {

        if (!req.file) {
            return res.status(400).send('Please upload an image.');
        }

        const { filename } = req.file;

        const newBanner = new Banner({
            title: req.body.title, 
            image: filename, 
        });

        await newBanner.save();

       res.redirect('/admin/bannerManagement')

    } catch (error) {
        console.log("error while uploading the banner:",error);
    }
}



module.exports={
    bannerManagement,
    uploadBanner
}