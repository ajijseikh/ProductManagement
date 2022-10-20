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
// =================================== put api ==================================================>
const updateCart = async function(req,res){
  try{
  let userId = req.params.userId
  let {cartId,productId,removeProduct} = req.body
  if(!mongoose.isValidObjectId(userId)){
      return res.status(400).send({status:false,message:"plz provide valid userId"})
  }
  if(!Object.keys(req.body).length === 0){
      return res.status(400).send({status:false,message:"data not found for updation"})
  }
  if(!mongoose.isValidObjectId(cartId)){
      return res.status(400).send({status:false,message:"plz provide valid userId"})
  }
  if(!mongoose.isValidObjectId(productId)){
      return res.status(400).send({status:false,message:"plz provide valid userId"})
  }
  if(!/^(0|1)$/.test(removeProduct)){
      return res.status(400).send({status:false, message:"removeProduct value should be 0 or 1"})
  }
  // and then check user exist or not
  const checkUser = await userModel.findById(userId)
  if(!checkUser){
      return res.status(404).send({status: false,message: "user with given userId does not exist",});
  }
  const checkCart= await cartModel.findOne({_id:cartId, userId:userId})
  if(!checkCart){
      return res.status(400).send({status: false,message: "CartId does not belong to user",});
  }
  const checkProduct = await productModel.findOne({_id:productId,isDeleted:false})
  if(!checkProduct){
      return res.status(404).send({status: false,message: "product with given productId is deleted",});
  }
  const checkCartProduct = await cartModel.findOne({_id:cartId,"items.productId": productId})
  if (!checkCartProduct){
       return res.status(404).send({status:false, message:"entered productId does not exist in cart"})
  }
     
  let cartArray = checkCart.items;
  if (checkCart.items.length === 0) return res.status(400).send({status:false, message:"cart is already empty."})
  
  for (let i = 0; i < cartArray.length; i++) {
    if (cartArray[i].productId == productId) { 
      let Price = cartArray[i].quantity * checkProduct.price; 
      if (removeProduct == 0) {
        const data = await cartModel.findByIdAndUpdate(cartId ,{$pull: { items: { productId } }, totalPrice: checkCart.totalPrice - Price, totalItems: checkCart.totalItems - 1, },{ new: true });
        return res.status(200).send({status: true,message: "removed product",data });
      }
      if (removeProduct == 1) {
        if (cartArray[i].quantity == 1 && removeProduct == 1) { 
          const data = await cartModel.findByIdAndUpdate(cartId ,{$pull: { items: {  productId } },totalPrice: checkCart.totalPrice - Price,totalItems: checkCart.totalItems - 1,},{ new: true });
          return res.status(200).send({status: true,message: "removed product",data});
        }
        cartArray[i].quantity = cartArray[i].quantity - 1;  
        const data = await cartModel.findByIdAndUpdate(cartId ,{items: cartArray,totalPrice: checkCart.totalPrice - checkProduct.price, },{ new: true });
        return res.status(200).send({status: true,message: "decreased quantity",data});
      }
    }
  }

} catch (err) {return res.status(500).send({ status: false, message: err.message })}

}




// ============================================ get api =========================================>


const getCart = async function (req, res) {
  try {
    let userId = req.params.userId;
    // if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: " Invalid userId format" });

    const userCheck = await userModel.find({ userId });
    if (!userCheck) return res.status(404).send({ status: false, message: "User not found" });
   
    const cartCheck = await cartModel.findOne({ userId }).populate("items.productId");
    if (!cartCheck) return res.status(404).send({ status: false, message: "No cart found for this user" });

    return res.status(200).send({ status: true,message:"cart details", data: cartCheck });
  } catch (err) {return res.status(500).send({ status: false, message: err.message });}
};





//========================================== delete api ==================================

const deleteCart = async function (req, res) {

  try {
      let userId = req.params.userId;
      if(!isValidObjectId(userId)){
          return res.status(400).send({status:false,msg:"userId is not in correct format"})
      }

      let isValidCart = await cartModel.findOne({ userId: userId })

      //check if cart exist-
      if (!isValidCart) {
          return res.status(400).send({ status: false, message: "No such cart exist" })
      }

      
      //check if user exist-
      let isValidUser = await userModel.findById(userId)


      if (!isValidUser) {
          return res.status(400).send({ status: false, message: "User doesn't exist" })
      }


      let deletedProduct = await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalPrice: 0, totalItems: 0 } }, { new: true })


      return res.status(204).send({ status: true, message: true, data: deletedProduct })
  } catch (err) {
      return res.status(500).send({ status: false, message: err.message })
  }
}




module.exports={createCart,getCart,deleteCart,updateCart}




