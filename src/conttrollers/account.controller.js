const { hashSync, compareSync } = require("bcryptjs");
const AccountModel = require("../models/Account");
const jwt = require("jsonwebtoken");
const { config } = require("../config");
const { isEmailValid, isPhoneNumberValid } = require("../utils/validation");
const {cloudinary, assets } = require("../utils/cloudinary");
const {APIError } = require("../middlewares/errorAPI");
const ProfileModel = require("../models/profile");

exports.register = async(req, res, next)  =>{
    try{
        const {firstname, lastname, username, email, number, birthDate, origin, address, password } = req.body; 

        if(!firstname) return res.status(400).json({error:"firstname is required"});
        if(!lastname) return res.status(400).json({error:"lastname is required"});
        if(!username) return res.status(400).json({error:"username is required"});
        if(!email) return res.status(400).json({error:"email is required"});
        if(!number) return res.status(400).json({error:"number is required"});
        if(!birthDate) return re.status(400).json({error:"birthDate is required"});
        if(!origin) return res.status(400).json({error:"origin is required"});
        if(!address) return res.status(400).json({error:"address is required"});
        if(!password) return res.status(400).json({error:"password is required"});


        if(!isEmailValid(email)) return next(APIError.badRequest("Invalid email")) 

        const emailExist = await AccountModel.findOne({email}).exec();

        if(emailExist) return res.status(200).json({error:"email already exist"})
        console.log(req.body);

        if(!isPhoneNumberValid(number)) return next (APIError.badRequest("Invalid Nigerian Number"))

        const hashedPassword = hashSync(password,10);


        const user = {
            firstname,
            lastname,
            username,
            email,
            number,
            birthDate,
            origin,
            address,
            password:hashedPassword,
            type:"user"
            
        }
        const newUser = await AccountModel.create({...user})
        if(!newUser)res.status(400).json({err:"it's late bro"})

        res.status(200).json({success:true, msg:"Account successfuly created"})
    } catch(error){
        next(error)
    }
}



exports.login = async (req, res, next) =>{
    try{
        let token = req.headers?.cookie?.split("=")[1];
        const {username, password} = req.body; 

        if(!username)return res.status(400).json({error:"username is required"});

        if(!password)return res.status(400).json({error:"password is required"});


        const userExist = await AccountModel.findOne({username});
        if(!userExist)return next(APIError.notFound("User Not Found"))

        const checkUser = compareSync(password,userExist.password)
        if(!checkUser) return next.status(400).json({error:"Incorrect Password"})
        if(userExist.state === "deactivated") return next(APIError.unauthorized("Account has been denied"))

        if(token) return res.status(403).json({error:"You are already logged in"})

        // authentication

        const payload = {
            id:userExist._id,
            email:userExist.email,
            role:userExist.type
        };

        const accessToken = jwt.sign(payload,config.ACCESS_TOKEN_SECRET,{expiresIn:"15m"});
        const refreshToken = jwt.sign(payload,config.ACCESS_TOKEN_SECRET,{expiresIn:"30m"});
        // userExist.refreshToken.push(refreshToken)
        userExist.save();
        res.cookie(
            "logistics", accessToken, {
                httpOnly:false,
                secure:true,
                samesites: "none"
            })
        

            res.status(200).json({
                msg: "login successful",
                user:{
                    username: userExist.username,
                    email: userExist.email,
                    firstname: userExist.firstname,
                },
                accessToken,
                refreshToken,
            })

    }catch(error){
        next(error)
    }
}


exports.logout = async (req, res, next) =>{
    try{
            let token = req.headers?.authorization?.split(" ")[1];
            if(!token) token = req.cookie?.logistics;
            if(!token) token = req.headers?.cookie?.split("=")[1];
    const {refreshToken} = req.body;

    if(!refreshToken) return res.status(400).json({error: "RefreshToken is Required"})
    if(!token) return res.status(400).json({error: "AccessToken is Required"})
const checkToken = jwt.decode(token, config.ACCESS_TOKEN_SECRET)
    if(!checkToken || checkToken.error) return next(APIError.unauthenticated());

    const foundUser = await AccountModel.findOne({refreshToken}).exec();
    //Detected refresh toke reuse
    if(!foundUser) {
        jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET, async (err, decoded) =>{
            if(err)return next(APIError.unauthorized("Invalid Refresh Token"));
            const usedToken = await AccountModel.findOne({_id:decoded.id}).exec();
            usedToken.refreshToken = [];
            usedToken.save();
        });
    return next(APIError.unauthorized("Invalid Refresh Token"));
    }

console.log(foundUser)
const newRefreshTokenArr = foundUser.refreshToken.filter(rt => rt !== refreshToken);
// eveluate jwt
jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET, async (err, decoded) =>{
    if (err){
        foundUser.refreshToken = [...newRefreshTokenArr];
        foundUser.save();
    }
if(err || foundUser._id.toString() !==decoded.id) return next(APIError.unauthenticated("Token Expired"));
});
foundUser.refreshRefreshToken = [...newRefreshTokenArr];
foundUser.save();
res.clearCookie("logistics");
res
.status(200)
.json({succces:true, msg: "You have succesfully logged out"});
window.location.href ="./logins.html"

    }catch (error){
        next (error)
    }
}


exports.refreshToken = async (req, res, next) =>{
    try{
        let token = req.cookie?.logistics;
         if(!token) token = req.headers?.authorization?.split(" ")[1];
        if (!token) token = req.headers?.cookie?.split("=")[1];
        const {refreshToken} = req.body;
        if(!refreshToken) return next(APIError.badRequest("RefreshToken is Required"))
        if(!token) return next(APIError.badRequest("AccessToken is Required"));
        const checkToken = jwt.decode(token, config.ACCESS_TOKEN_SECRET);
        if(!checkToken || checkToken.error) return next(APIError.unauthenticated());

        const foundUser = await AccountModel.findOne({refreshToken}).exec();
        //Detected refresh toke reuse
        if(!foundUser) {
            jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET, async (err, decoded) =>{
                if(err)return next(APIError.unauthorized("Invalid Refresh Token"));
                const usedToken = await AccountModel.findOne({_id:decoded.id}).exec();
                usedToken.refreshToken = [];
                usedToken.save();
            });
        return next(APIError.unauthorized("Invalid Refresh Token"));
        }
        const newRefreshTokenArr = foundUser.refreshToken.filter(rt => rt !== refreshToken);
        //avaluate jwt
        jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET, async (err, decoded) =>{
            if(err){
                foundUser.refreshToken = [...newRefreshTokenArr];
                foundUser.save();
            }
        if(err || foundUser. id.toString() !== decoded.id) return next(APIError.unauthenticated("Token Expired"));
        });
        //Refresh token still valid
        const payload = {
            id: foundUser._id,
            email:foundUser.email,
            role:foundUser.type
        };
        const accessToken = jwt.sign(payload,config.ACCESS_TOKEN_SECRET,{expiresIn:"15m"});
        const newRefreshToken = jwt.sign(payload,config.REFRESH_TOKEN_SECRET,{expiresIn:"30m"});
        foundUser.refreshToken = [...newRefreshTokenArr, newRefreshToken];
        foundUser.save();
        res.cookie();
        "logistics", accessToken, {
        httpOnly:false,
        secure:true,
        samesites: "none",
    }
            return res.status(200).json({
                msg: "RefreshToken Renewed",
                accessToken,
                newRefreshToken,
            })
        
        } catch (error){
            next (error)
        }
    }
    