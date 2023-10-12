
//sent otp
const sentOtp=async(req,res)=>{

  const timeStamp = new Date();
  const year = timeStamp.getFullYear();
  const month = String(timeStamp.getMonth() + 1).padStart(2, '0'); 
  const day = String(timeStamp.getDate()).padStart(2, '0');
  
  const formattedDate = `${year}-${month}-${day}`;
  const pass = await bcrypt.hash(req.body.password, 10);

  const userdata = {
    name: req.body.name,
    email: req.body.email,
    password: pass,
    phone:req.body.phone,
    timeStamp: formattedDate
  };
  const {phone,email} = req.body;
  const datas = await register.findOne({ $or: [{ email }, { phone }]});
  if(datas){
    // console.log(datas)
    req.session.errmsg = "Email or phone number already exists.";
    res.redirect('/signup')
  }else{
    
    try {
      
      const data = await sentOTP(phone);
      console.log(data.phone);

      // Check if the OTP was sent successfully before rendering the OTP page
      if (data && data.success) {
        
        const insert = await register.insertMany([userdata]);
        res.render("user/otp", { data });
      } else {
        
        console.error("OTP sending failed");
       
      }
  }catch (error) {
    // Handle any errors that may occur during OTP sending
    console.error(error);
    res.status(500).send("Internal server error");
  }
}
}

//verify OTP
const verifyOTP=async(req,res)=>{
  try{
    const otpDigits = [
      req.body.num1,
      req.body.num2,
      req.body.num3,
      req.body.num4,
      req.body.num5,
      req.body.num6,
    ];

    const phone = req.body.phone;


    console.log('Phone Number:', phone);

    const otp = otpDigits.join('');
    const verifySid = process.env.VERIFY_SID;

    const verifiedResponse = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({
        to: `+91${phone}`, 
        code: otp,
      });

    if (verifiedResponse.status === 'approved') {
    
      console.log('OTP verified successfully');
      
      res.redirect('/')
    } else {
      console.log('Invalid OTP');
    }
  }catch(err){
    throw err
  }
}
