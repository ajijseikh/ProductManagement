const express = require('express');
const router = express.Router();
const {createUser,UpdateUser}=require("../controllers/userController")
const {placedOrder}=require("../controllers/orderController")


const {Authentication, login}=require("../controllers/userLogin")

const {productRegister,getProducts,getProductById,deleteProduct}=require("../controllers/productController")

const {createCart,getCart,deleteCart}=require("../controllers/cartController")

router.post("/register",createUser)
router.put("/user/:userId/profile",UpdateUser)

router.post("/login", login);

router.post("/check",Authentication)


/// product api
router.post("/products",productRegister)
router.get("/products/",getProducts)
router.get("/products/:productId",getProductById)
router.delete("/products/:productId",deleteProduct)

/// cart api
router.post("/users/:userId/cart",createCart)
router.get("/users/:userId/cart",getCart)
router.delete("/users/:userId/cart",deleteCart)

/*ORDER APIs */
router.post("/users/:userId/orders", placedOrder)


module.exports=router;