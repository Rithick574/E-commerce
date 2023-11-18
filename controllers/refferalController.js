const Referral = require("../model/referralSchema");
const User = require("../model/userSchema");

const updateReferralAmount = async (req, res) => {
  const { refferalAmount } = req.body;

  try {
    const referral = await Referral.findOne();

    if (!referral) {
      await Referral.create({ amount: refferalAmount });
    } else {
      referral.amount = refferalAmount;
      await referral.save();
    }

    res.redirect("/admin/refferal");
  } catch (error) {
    console.error("Error updating referral amount:", error);
    res.status(500).send("Internal Server Error");
  }
};

//wallet get
const getWallet = async (req, res) => {
  try {
    const Email = req.session.user;
    const user = await User.findOne({ email: Email }).populate('referredUsers');
    const userReferred = user.referredBy;

    if (!userReferred) {
      return res.render("user/wallet", { username: Email, user,referred:'' });
    }

    const referred = await User.findById(userReferred);

    if (!referred) {
      console.error("Referred user not found");
      return res.render("user/wallet", { username: Email, user, referre:'' });
    }

    res.render("user/wallet", { username: Email, user, referred });
  } catch (error) {
    console.error("Error while rendering the wallet page:", error);
  }
};

module.exports = {
  updateReferralAmount,
  getWallet,
};
