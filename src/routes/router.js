const express = require('express');
const router = express.Router();
const {createUser,UpdateUser}=require("../controllers/userController")

router.post("/register",createUser)
router.put("/user/:userId/profile",UpdateUser)


module.exports=router;