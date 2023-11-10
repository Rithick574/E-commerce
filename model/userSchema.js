const mongoose=require('mongoose')
require("../config/DBconnection")

const UserSchema= new mongoose.Schema({
    name: { 
        type: String, 
         required:true
        },
    email: { 
        type: String ,
        required:true
    },
    timeStamp:{type:Date},
    profilePhoto:{type:String},
    phone: {
        type: String,
        // required: true
    },
    password: {
         type: String,
        //  required:true
         },
    Status: {
         type: String ,
         default:"Active"},
    Orders: [{
        }],
    Address: [{
            Name: {type: String},
            AddressLane: { type: String },
            City: { type: String },
            Pincode: { type: Number },
            State: { type: String },
            Mobile: { type: Number },
         }],
    Cart: [{
        }],
});


UserSchema.statics.getUsers = async function () {
    try {
        const users = await this.find();
        return users;
    } catch (error) {
        throw error;
    }
};



const users = mongoose.model('users',UserSchema);

module.exports= users;
