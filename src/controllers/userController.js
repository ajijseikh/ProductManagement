
const userModel=require("../models/userModel");




//TODO<============================ Create User Api =============================================>

const createUser= async (req,res)=>{
    try {
           const data=req.body
           if(!data){
            return res.status(400).send({status:false,message:"Please provode user data"})}
           let {fname,lname,email,profileImage,phone, password, address}=data

        
    } catch (error) {
        return res.status(500).send({status:false,message:error.message})
    }
}