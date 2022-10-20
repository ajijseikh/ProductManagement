const userModel=require("../models/userModel")
const orderModel=require("../models/orderModel")
const mongoose = require('mongoose')
const cartModel = require('../models/cartModel')



let {isValidObjectId,checkStatus}=require("../validations/userValidation")









//<================================= put api =====================================================>


const updateOrder = async function (req, res) {
   try{
    let { orderId, status } = req.body
    let userId = req.params.userId


    if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "invalid user Id.." })
    if (!await userModel.findById({ _id: userId })) return res.status(404).send({ status: false, message: "user not found" })

    if (!orderId) return res.status(400).send({ status: false, message: "Provide orderId " })
    if (!isValidObjectId(orderId)) return res.status(400).send({ status: false, message: "invalid order Id.." })
    const orderDetails=await orderModel.findById({orderId})
    console.log(orderDetails)
    if(!orderDetails) return res.status(400).send({ status: false, message: "oder is not found" })
    if(orderDetails.status==="cancelled") return res.status(400).send({status:false,message:"this order already deleted, you can't update it"})
    if(orderDetails.userId != userId) return res.status(400).send({status:false,message:"this oder does not from order collection"})

    if(!status)return res.status(400).send({ status: false, message: "provide status" })
    if(!checkStatus(status)) return res.status(400).send({ status: false, message: "provide status" })
    if(status=="cancelled" && orderDetails.cancellable !==true) return res.status(400).send({status:false,message:"you can't cencel this"})
     
    let updatedOrder = await orderModel.findOneAndUpdate({ _id: orderId }, { status: status }, { new: true })
    if (updatedOrder.status == "completed") {
        await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalItems: 0, totalPrice: 0 } }, { new: true })

    }
}catch(error){
    res.status(500).send({status:false,error:error.message})
}
}


module.exports={updateOrder}

// 

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






















































/