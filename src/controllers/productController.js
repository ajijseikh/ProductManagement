const productModel=require("../models/productModel")
const {isBodyEmpty,isValid,removeSpaces,acceptFileType,isEmpty}=require("../validations/commonValidation")

const {checkSizes}=require("../validations/userValidation")
const aws=require("./awsConfig")






// TODO<================================ Product Create ==========================================>

const productRegister=async (req,res)=>{
    try {
        const data=req.body
       // console.log(data)
        // if(!isBodyEmpty(data)) return res.status(500).send({status:false, message:"please provide data"})
        
        let {title, description , price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments  }=data

        if(!isValid(title)) return res.status(400).send({status:false, message:"Title tag is Required"})
    title = removeSpaces(title) 

    // if(!isValid(description)) return res.status(400).send({status:false, message:"Description tag is Required"}) 
    // description=removeSpaces(description) 

    if(!isValid(price)) return res.status(400).send({status:false, message:"Price tag is Required"}) 
    // if(!IsNumuric(price)) return res.status(400).send({status:false, message:"price must be a number"}) 

    if(currencyId || currencyId == ''){
        if(!isValid(currencyId)) return res.status(400).send({status:false, message:"CurrencyId tag is Required"}) 
        if(currencyId.toUpperCase()!="INR") return res.status(400).send({status:false, message:"Please provide currencyId only 'INR'"}) 
    }

        
  

    if(currencyFormat || currencyFormat==''){
        if(!isValid(currencyFormat)) return res.status(400).send({status:false, message:"CurrencyFormat tag is Required"}) 
        if(currencyFormat !="₹") return res.status(400).send({status:false, message:"Only Indian Currency ₹ accepted"}) 
       }
       
    
        if(isFreeShipping || isFreeShipping==''){
            let boolArr = ["true", "false"]
            // if(typeof isFreeShipping != 'Boolean') 
            if(!boolArr.includes(isFreeShipping)) return res.status(400).send({status:false, message:"isFreeShipping type must be boolean"}) 
        }
    
        if(style || style==''){
            if(!isValid(style)) return res.status(400).send({status:false, message:"If you are provide stype key then you have to provide some data"}) 
            style = removeSpaces(style)
        }
    
    
        if(!availableSizes) return res.status(400).send({ status: false, msg: "availableSizes should be present" })
    
    
        let allSizes = availableSizes.split(",");
        let bool = await checkSizes(allSizes);
        if(bool){
        availableSizes = [...allSizes]
        }
    
    
    
       if(!bool) return res.status(400).send({ status:false, Message: 'available size should be in uppercase and accepted sizes are: ["S", "XS", "M", "X", "L", "XXL", "XL"] !' })
    
       if(installments){
        if(!isValid(installments)) return res.status(400).send({status:false, message:"installments tag is required"}) 
        // if(!IsNumuric(installments)) return res.status(400).send({status:false, message:"installments must be number"})
       }
       
       let files = req.files;
       if(files.length==0) return res.status(400).send({ status: !true, message: "productImage is required" })
       if(!acceptFileType(files[0],'image/jpg', 'image/png','image/jpeg'))  return res.status(400).send({ status: false, message: "we accept jpg, jpeg or png as product image only" })
       let myUrl = await aws.uploadFile(files[0]);
       productImage=myUrl

       let isTitleExist = await productModel.findOne({title:title});
   if(isTitleExist) return res.status(409).send({status:false, message:`this "${title}" title already available, Please provide unique title`});
   
   let finalData = {title,description , price, currencyId, currencyFormat, isFreeShipping, style, availableSizes:[...allSizes], installments,productImage}

   let my= await productModel.create(finalData);
   console.log(my)
   res.status(201).send({status:true, data:my})


} catch (error) {
    return res.status(500).send({status:false,error:error.message})
    
}
}


module.exports={productRegister}