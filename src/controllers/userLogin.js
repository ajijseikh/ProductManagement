const userModel=require("../models/userModel")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")

const {isValidObjectId,isValidEmail,isValidPassword}=require("../validations/userValidation")



const login = async(req, res) =>{
    try {

    let {email , password} = req.body;

    if(!req.body) return res.status(400).send({status:false, message:"please provide data" })

    if(!email) return res.status(400).send({status:false, message:"Please Enter EmailID" })

    if(!isValidEmail) return res.status(400).send({status:false, message:"Please enter valid email" })

    if(!password) return res.status(400).send({status:false, message:"Please Enter Password" })

    if(!isValidPassword) return res.status(400).send({status:false, message:"Please Enter valid Password" })

    const userDetail = await userModel.findOne({email});

    if(!userDetail) return res.status(404).send({status:false, message:"User not Register" });

    const matchPassword = await bcrypt.compare(password,userDetail.password);

    if(!matchPassword) return res.status(401).send({status:false, message:"Invalid credentials" });

    const token = jwt.sign({_id:userDetail._id},"productmanagementgroup29",{expiresIn:"24h"});

    return res.status(200).send({status:true,message:"login succesfull",data:{userId:userDetail._id,token}})

    } catch (err) { return res.status(500).send({status:false,message:err.message})}
} 
module.exports.login=login





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