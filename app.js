require("dotenv").config({path: 'config.env' })
const express=require('express')
const cors=require("cors");
const morgan=require('morgan')
const nocache = require('nocache');
const session = require('express-session')
const { v4: uuidv4 } = require('uuid');
require('./config/DBconnection')


const userRouter=require("./routes/userRouter")
const adminRouter=require("./routes/adminRouter");



const app=express()



//cors
app.use(
    cors({
      origin:"http://localhost:8080",
      methods:"GET,POST,PUT,DELETE",
      credentials:true,
    })
  )



//view engine setting
app.set('view engine','ejs')



//to parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//static file
app.use(express.static('public'))


//morgan
app.use(morgan('tiny'))


//nocache
app.use(nocache());



//session
app.use(
    session({
      secret: uuidv4(),
      cookie:{maxAge:60000},
      resave: false,
      saveUninitialized: false,
    })
  );



//routes
app.use('/',userRouter)
app.use("/admin",adminRouter.admin);




//port setting
const PORT=process.env.PORT  || 8000


//port listening
app.listen(PORT,()=>{
    console.log(`hosted at http://localhost:${PORT}`)
})