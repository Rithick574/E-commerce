const verifyUser = (req, res, next) => {
  if (req.session.loggedin) {
    next();
  } else {
    res.redirect("/guestuser");
    // res.redirect('/logout')
  }
};


const userExist = (req, res, next) => {
  if (req.session.loggedin) {
    res.redirect("/");
  } else {
    next();
  }
};

module.exports = { 
    verifyUser ,
    userExist
};
