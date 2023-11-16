require('../config/DBconnection')
const Banner = require("../model/bannerSchema");


const bannerManagement=async(req,res)=>{
const banners=await Banner.find()
res.render('admin/bannerManagement',{banners})

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

//delete banner
const deleteBanner=async(req,res)=>{
    try {
        const bannerId = req.params.bannerId;
        await Banner.findByIdAndDelete(bannerId);
        res.redirect('/admin/bannerManagement');
    } catch (error) {
        console.error('error while delete banner:',error)
    }
}



module.exports={
    bannerManagement,
    uploadBanner,
    deleteBanner
}