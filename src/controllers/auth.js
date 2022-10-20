const userModel=require("../models/userModel")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")

const {isValidObjectId,isValidEmail,isValidPassword}=require("../validations/userValidation")

//TODO <======================================= Authentication ===================================>


const Authentication= async (req,res,next)=>{
    try {
         let token=req.headers.authorization
       //  console.log(token)
          if(!token){
            return res.status(400).send({status:false,message:"token is not present"})
          }
          
      let splitToken = token.split(" ")
      
      token = splitToken[1]
    
     jwt.verify(token,"productmanagementgroup29",(error,token)=>{
       
      if(error)return res.status(400).send({status:false,error:error.message})
      console.log(token._id)
      req["decodedTokenId"]=token._id
      next()
     })

        
    } catch (error) {
      return res.status(500).send({status:false,message:err.message})
    }
}

module.exports.Authentication=Authentication


// TODO<======================================== authorization ===============================>

const authorization=async (req,res,next)=>{
  try {
    let userId = req.params.userId
    let validId = req.decodedTokenId
  
    if (!isValidObjectId(userId)) { return res.status(400).send({status:false, message:"please enter valid user Id"})}
  
    let checkUser = await userModel.findById(userId)
    if(!checkUser) { return res.status(404).send({status:false, message:"user not found"})}
  
    if (userId != validId) {return res.status(403).send({status: false, message: "you are not authorized to do this"})}
  
    next()
    
  } catch (error) {
    return res.status(500).send({status:false,message:err.message})
  }
}

module.exports.authorization=authorization
