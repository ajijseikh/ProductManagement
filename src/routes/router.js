const express = require('express');
const router = express.Router();
const {createUser,UpdateUser}=require("../controllers/userController")

<<<<<<< HEAD
router.post("/register",createUser)
router.put("/user/:userId/profile",UpdateUser)

=======
router.post("/login", login);
>>>>>>> d3a297eb9b193ff05cec0ef803bbb9cb2793d63e

module.exports=router;