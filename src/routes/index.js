const express = require("express");
const { userRequired } = require("../middlewares/auth.middleware");
const { register, login, logout, refreshToken } = require("../conttrollers/account.controller");


const router = express.Router();
router.post("/user/register",register)
router.post("/user/login", login),
router.post("/user/logout", userRequired, logout),
router.post("/user/refreshToken", refreshToken) 

module.exports = router;


