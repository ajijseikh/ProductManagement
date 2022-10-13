const productModel=require("../models/productModel")






// TODO<================================ Product Create ==========================================>

const productRegister=async (req,res)=>{
    try {
        const data=req.body
        if(!data) return res.status(500).send({status:false, message:"please provide data"})
        let {}=data
        
    } catch (error) {
        return res.status(500).send({status:false,error:error.message})
        
    }
}