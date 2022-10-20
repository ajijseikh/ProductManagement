const express = require('express');
const router = express.Router();
const {createUser,UpdateUser,login,getUser,updateUser}=require("../controllers/userController")
const {placedOrder,updateorder}=require("../controllers/orderController")
const {Authentication,authorization}=require("../controllers/auth")
const {productRegister,getProducts,getProductById,updateProduct,deleteProduct}=require("../controllers/productController")

const {createCart,getCart,updateCart,deleteCart}=require("../controllers/cartController")

/// user api
router.post("/register",createUser)
router.post("/login", login);
router.get("/user/:userId/profile",Authentication,getUser)
router.put("/user/:userId/profile",Authentication,authorization,updateUser)


/// product api
router.post("/products",productRegister)
router.get("/products/",getProducts)
router.get("/products/:productId",getProductById)
router.put("/products/:productId",updateProduct)
router.delete("/products/:productId",deleteProduct)

/// cart api
router.post("/users/:userId/cart",Authentication,authorization,createCart)
router.get("/users/:userId/cart",Authentication,getCart)
router.put("/users/:userId/cart",Authentication,updateCart)
router.delete("/users/:userId/cart",Authentication,deleteCart)

// order api
router.post("/users/:userId/orders",Authentication,placedOrder)
router.put("/users/:userId/orders",Authentication,updateorder)

// all route handle
router.all("/*", function (req ,res){
    res.status(400).send("Invalid request........!!!")
})



module.exports=router;