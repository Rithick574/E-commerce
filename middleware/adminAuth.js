const verifyAdmin=(req,res,next)=>{
    if((req.session.logged)){
        next()
    }else{
        res.redirect('/admin/login'); 
    }
}


const adminExist=(req,res,next)=>{
    if(req.session.logged){
        res.redirect('/admin/dashboard')
    }else{
     next()
    }
}


module.exports={
    verifyAdmin,
    adminExist
}