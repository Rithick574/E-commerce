const express=require("express");
const session = require("express-session");
const user=express.Router()
const passport=require("passport")
const bcrypt=require("bcrypt")
const userController = require('../controllers/userController')



user.get('/', userController.homePage);
user.get('/logout',userController.logOut)
user.get('/login',userController.login);






module.exports = user;    