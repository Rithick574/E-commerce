require('events').EventEmitter.defaultMaxListeners = 15;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.VERIFY_SID;



 const client = require('twilio') (accountSid, authToken, { 
  lazyLoading: true
})

const sentOTP = async (phone, res) => {
  console.log(phone);
  try {
    const otpResponse = await client.verify.v2
      .services(verifySid)
      .verifications.create({
        to: `+91${phone}`,
        channel: "sms",
      });
      console.log("otp sented successfully");
      return { success: true ,phone};
  }catch (error) {
    if (error) {
   
      console.error("OTP sending failed:", error);
      return { success: false, error: error.message };
    } 
  }
};

module.exports = {
  sentOTP,
};

