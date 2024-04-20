const cloudinary = require(`cloudinary`).v2;
require("dotenv").config();

// configure cloudinary

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME ,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


const assets = {
    upload_preset:"logistics",
    folder:"logistics_folder",
  }
  
  
  module.exports = {
    cloudinary,
    assets,
  }