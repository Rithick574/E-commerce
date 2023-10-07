const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");




const homePage = (req, res) => {
   res.render('user/home')
  };

const logOut = (req,res) =>{
  req.session.destroy()
  res.redirect('/login')
}

const login = (req,res)=>{
  res.render('user/usersignup')
}


  
  module.exports = {
    homePage,
    logOut,
    login
  };

  