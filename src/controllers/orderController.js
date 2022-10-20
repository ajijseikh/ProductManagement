const userModel=require("../models/userModel")
const orderModel=require("../models/orderModel")

const cartModel = require('../models/cartModel')



let {isValidObjectId}=require("../validations/userValidation")

// <================================ 

// -------------------placed order----------------------------//
const placedOrder = async function(req,res){
    try{
    let userId = req.params.userId
    if(!isValidObjectId(userId)){
        return res.status(400).send({status:false,message:"plz provide valid userId "})
    }
    const userCheck = await userModel.findOne({userId:userId})
    if(!userCheck){
        return res.status(400).send({status:false, message:"user does not exist"})
    }
    let cartId = req.body.cartId
    if(!isValidObjectId(cartId)){
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
    return res.status(201).send({ status: true, message: "Success", data: orderData })

}catch(err){res.status(500).send({status:false,message:err.message})}

}
module.exports.placedOrder=placedOrder



///  =============================put api ==================================>


const updateorder = async function (req, res) {
    try {
        let userId = req.params.userId
        let { orderId, status } = req.body

        if (typeof (orderId) === "undefined" || typeof (status) === "undefined") return res.status(400).send({ status: false, mesage: "please enter orderId and status to update" })
        if (!isValidObjectId(orderId)) return res.status(400).send({ status: false, mesage: "please enter a valid orderid" })

        let orderdata = await orderModel.findOne({ _id: orderId, userId: userId })
        if (!orderdata) return res.status(404).send({ status: false, message: "no order found with this orderid and userid" })
        if (orderdata.cancellable == "false"){
        if ((orderdata.status == "pending")) return res.status(400).send({ status: false, message: "this order status is not  pending anymore u can't update" })}
        if (orderdata.cancellable == "false") return res.status(404).send({ status: false, message: "can't update order status, cancellable key is false" })

        if (orderdata.status == status) return res.status(400).send({ status: false, message: "this status is already present enter another one" })

        if (!['pending', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).send({
                status: false, message: "STATUS YOU WANT PROVIDED ['pending', 'completed', 'cancled'] ONLY THESE ENUm"
            })

        }
        const updateorder = await orderModel.findByIdAndUpdate(
            { _id: orderId },
            { $set: { status: status } },
            { new: true }
        )
        console.log(updateorder)
         { return res.status(200).send({ status:true, message:"Success", data: updateorder }) }
      
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}


module.exports.updateorder =updateorder






































