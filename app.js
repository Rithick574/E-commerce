require("dotenv").config({path: 'config.env' })
const express=require('express')
const cors=require("cors");
const morgan=require('morgan')
const path=require('path')
const nocache = require('nocache');
const session = require('express-session')
const { v4: uuidv4 } = require('uuid');
const connectDB=require('./config/DBconnection')
const multer=require("multer")
const passport=require("passport")



const userRouter=require("./routes/userRouter")
const adminRouter=require("./routes/adminRouter");



const app=express()

app.use(nocache());

//view engine setting
app.set('view engine','ejs')



//to parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//static file
app.use(express.static('public'))

app.use('/addproducts',express.static(path.join(__dirname,'products')));



//morgan
app.use(morgan('tiny'))

//cookie

// app.use(cookieParser());

//nocache


//session
app.use(
    session({
      secret: uuidv4(),
      cookie:{maxAge:480000},
      resave: false,
      saveUninitialized: false,
    })
  );


//cors
app.use(
  cors({
    origin:"http://localhost:8080",
    methods:"GET,POST,PUT,DELETE",
    credentials:true,
  })
)


// // // Passport initialization
app.use(passport.initialize());
app.use(passport.session());




//routes
app.use('/',userRouter)
app.use("/admin",adminRouter.admin);




//port setting
const PORT=process.env.PORT  || 8000


//port listening
app.listen(PORT,()=>{
    console.log(`hosted at http://localhost:${PORT}`)
})