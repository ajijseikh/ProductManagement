const express = require('express');
const router = express.Router();
const {createUser,UpdateUser}=require("../controllers/userController")

const {Authentication, login}=require("../controllers/userLogin")

const {productRegister}=require("../controllers/productController")

router.post("/register",createUser)
router.put("/user/:userId/profile",UpdateUser)

router.post("/login", login);

router.post("/check",Authentication)


/// product api
router.post("/products",productRegister)

module.exports=router;