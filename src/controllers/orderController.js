const userModel=require("../models/userModel")
const product=require("../models/productModel")
const orderModel=require("../models/orderModel")

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