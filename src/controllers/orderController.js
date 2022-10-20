const mongoose = require('mongoose')
const cartModel = require('../models/cartModel')
const orderModel = require('../models/orderModel')
const userModel = require('../models/userModel')
// -------------------placed order----------------------------//
const placedOrder = async function(req,res){
    try{
    let userId = req.params.userId
    if(mongoose.isValidObjectId(userId)){
        return res.status(400).send({status:false,message:"plz provide valid userId "})
    }
    const userCheck = await userModel.find(userId)
    if(!userCheck){
        return res.status(400).send({status:false, message:"user does not exist"})
    }
    let cartId = req.body.cartId
    if(mongoose.isValidObjectId(cartId)){
        return res.status(400).send({status:false,message:"plz provide valid cartId"})
    }
    const checkCart = await cartModel.findOne({_id:cartId,userId:userId})
    if(!checkCart){
     return res.status(400).send({status:false,message:"cart does not belong to user"})
    }
    if(checkCart.items.length == 0){
         return res.status(400).send({status:false, message:"you can't order anything from empty cart"})
    }
    let totalQuantity = 0
    let cartItems = checkCart.items
    for (let i = 0; i < cartItems.length; i++) totalQuantity += checkCart.items[i].quantity

    let createOrder = {
        totalQuantity: totalQuantity,
        items: checkCart.items,
        totalPrice: checkCart.totalPrice,
        totalItems: checkCart.totalItems,
        userId: userId

    }
    const orderData = await orderModel.create(createOrder)
    return res.status(201).send({ status: true, message: "order placed successfully", data: orderData })

}catch(err){res.status(500).send({status:false,message:err.message})}

}
module.exports.placedOrder=placedOrder






















































// POST /users/:userId/orders
// Create an order for the user
// Make sure the userId in params and in JWT token match.
// Make sure the user exist
// Get cart details in the request body
// Response format
// On success - Return HTTP status 200. Also return the order document. The response should be a JSON object like this
// On error - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like this