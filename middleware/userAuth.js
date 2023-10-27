const register=require('../model/userSchema')

const verifyUser = async(req, res, next) => {
  if (req.session.loggedin) {
    const username = req.session.user;
    const user = await register.findOne({ email: username });
    if (user && user.Status === 'Blocked') {
      req.session.loggedin = false;
      return res.redirect('/login');
    }
    next();
  } else {
    res.redirect("/guestuser");
    // res.redirect('/logout')
  }  
};


const userExist = async(req, res, next) => {
  if (req.session.loggedin) {
    const username = req.session.user;
    const user = await register.findOne({ email: username });
    if (user && user.Status === 'Blocked') {
      req.session.destroy();
      return res.redirect('/login');
    }
    res.redirect("/");
  } else {
    next();
  }
};

module.exports = { 
    verifyUser ,
    userExist
};
