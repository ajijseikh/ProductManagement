const jwt =require('jsonwebtoken')
const userModel=require("../models/userModel");
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken')
const isValidBody = (value) => {
    return Object.keys(value).length > 0;
}




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


const login = async(req, res) =>{
    try {

    let {email , password} = req.body;

    if (!isValidBody(req.body)) return res.status(400).send({status:false, message:"User Data not Entered." })

    if(!email) return res.status(400).send({status:false, message:"Please Enter EmailID" })

    if(!password) return res.status(400).send({status:false, message:"Please Enter Password" })

    if(!/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(email)) return res.status(400).send({status:false, message:"Please enter valid email" })

    const userDetail = await userModel.findOne({email});

    if(!userDetail) return res.status(404).send({status:false, message:"User not Register" });

    const matchPassword = await bcrypt.compare(password,userDetail.password);

    if(!matchPassword) return res.status(401).send({status:false, message:"Invalid credentials" });

    const token = jwt.sign({_id:userDetail._id},"productmanagementgroup29",{expiresIn:"24h"});

    return res.status(200).send({status:true,message:"login succesfull",data:{userId:userDetail._id,token}})

    } catch (err) { return res.status(500).send({status:false,message:err.message})}
} 
module.exports.login=login
