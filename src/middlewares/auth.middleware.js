const { config } = require("../config");
const { APIError } = require("./errorAPI");
const jwt = require("jsonwebtoken");

exports.userRequired = (req, res, next) =>{
    try{
        console.log(req.body)
        let token = req.cookie?.Logistics;       // to get the cokkies
        if(!token) token = req.headers?.authorization?.split(" ")[1];
        if(!token) token = req.headers?.cookie?.split("=")[1];
        if(!token) token = req.body?.token;
        if(!token) return next(APIError.unauthenticated())
        const payload = jwt.verify(token, config.ACCESS_TOKEN_SECRET);
    req.userId = payload.id;
    req.userEmail = payload.email;
    req.userRole = payload.role;

    next();
    }catch(error){
        if(error.message === "jwt expired") next(APIError.unauthenticated("Access Token Expired"))
        else next(error);    // sending to the error middleware
    }
}

