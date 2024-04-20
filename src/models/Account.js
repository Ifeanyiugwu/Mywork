const { Schema, model } = require("mongoose")

const AccountSchema = new Schema({
    firstname:{
        type:String,
        require:true,
    },
    lastname:{
        type:String,
        required:true,
    },
    username:{
        type:String,
        required:true,
        unique:true,
        indexed:true,
    },
    email:{
        type:String,
        require:String,
        unique:true,
        indexed:true,
    },
    number:{
        type:String,
        require:true,
        unique:true,
        indexed:true,
    },
    birthDate:{
        type:Date,
        required:true,
    },
    origin:{
        type:String,
        required:true,
    },
    address:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
},{timestamps: true}
)
const  AccountModel = model("Account", AccountSchema)
module.exports = AccountModel;
