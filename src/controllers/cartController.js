const cartModel=require("../models/cartModel");
const userModel=require("../models/userModel");
const productModel=require("../models/productModel")


const {  isValidObjectId,  } = require('../validations/userValidation')


const createCart=async (req,res)=>{
    try {
        
        let data=req.body
       
        let {cartId,productId}=data
        let userId=req.params.userId

        let prodObj = {
            productId: productId,
            quantity: 1
          }
      
          if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "please enter valid user id" })
          let userChecking = await userModel.findOne({ _id: userId })
          if (!userChecking) return res.status(404).send({ status: false, message: "user not found" })
      
          if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "please enter valid product id" })
          let productChecking = await productModel.findOne({ isDeleted: false, _id: productId })
          if (!productChecking) return res.status(404).send({ status: false, message: "product not found" })
          let productPrice = productChecking.price
      
          if (cartId) {
            if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "please enter valid cartId id" })
            let cartFind = await cartModel.findOne({_id : cartId})
            if (!cartFind) return res.status(404).send({status: false, message : "cart not found"})
          }
          let checkChecking = await cartModel.findOne({ userId: userId })
 
      
          if (checkChecking) {
      
            let productIdCheck = checkChecking.items.map(x => x.productId.toString())
      
            if (productIdCheck.includes(productId)) {
              let array = checkChecking.items
              for (let i = 0; i < array.length; i++) {
                if (checkChecking.items[i].productId == productId) {
                  array[i].quantity = array[i].quantity + 1
                }
              }
              let increaseQuantity = await cartModel.findOneAndUpdate({ userId: userId }, { items: array, totalPrice: checkChecking.totalPrice + productPrice }, { new: true })
              return res.status(200).send({ status: true, message: "items added successfully", data: increaseQuantity })
      
            } else {
              let addProduct = await cartModel.findOneAndUpdate({ userId: userId }, { $push: { items: prodObj }, $inc: { totalItems: 1, totalPrice: productPrice } }, { new: true })
              return res.status(200).send({ status: true, message: "items added successfully", data: addProduct })
            }
      
          }
      
          // create cart
          let createCartObject = {
            userId: userId,
            items: [prodObj],
            totalItems: 1,
            totalPrice: productPrice
          }
      
          let savedData = await cartModel.create(createCartObject)
      
          return res.status(201).send({ status: true,message: "Success", data: savedData })

        

    } catch (error) {
        res.status(500).send({status:false,message:error.message})
    }
}
module.exports={createCart}