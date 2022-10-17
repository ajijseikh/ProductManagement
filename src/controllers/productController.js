const productModel=require("../models/productModel")
const {isBodyEmpty,isValid,removeSpaces,acceptFileType,isEmpty}=require("../validations/commonValidation")
const {isValidObjectId}=require("../validations/userValidation")

const {checkSizes}=require("../validations/userValidation")
const aws=require("./awsConfig")






// TODO<================================ Product Create ==========================================>

const productRegister=async (req,res)=>{
    try {
        const data=req.body
       // console.log(data)
        // if(!isBodyEmpty(data)) return res.status(500).send({status:false, message:"please provide data"})
        
        let {title, description , price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments,productImage  }=data

        if(!isValid(title)) return res.status(400).send({status:false, message:"Title tag is Required"})
    title = removeSpaces(title) 
 //console.log(description)
    // if(!isValid(description)) return res.status(400).send({status:false, message:"Description tag is Required"}) 
   // description=removeSpaces(description) 

    if(!isValid(price)) return res.status(400).send({status:false, message:"Price tag is Required"}) 
    // if(!IsNumuric(price)) return res.status(400).send({status:false, message:"price must be a number"}) 
    
    if(currencyId || currencyId == ''){
        if(!isValid(currencyId)) return res.status(400).send({status:false, message:"CurrencyId tag is Required"}) 
        if(currencyId!="INR") return res.status(400).send({status:false, message:"Please provide currencyId only 'INR'"}) 
    }

        
  

    if(currencyFormat || currencyFormat==''){
        if(!isValid(currencyFormat)) return res.status(400).send({status:false, message:"CurrencyFormat tag is Required"}) 
        if(currencyFormat !="₹") return res.status(400).send({status:false, message:"Only Indian Currency ₹ accepted"}) 
       }
       
    
        if(isFreeShipping || isFreeShipping==''){
            let boolArr = ["true", "false"]
             if(typeof isFreeShipping != 'Boolean') 
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
       //console.log(typeof(myUrl))
       productImage=myUrl

       let isTitleExist = await productModel.findOne({title:title});
   if(isTitleExist) return res.status(409).send({status:false, message:`this "${title}" title already available, Please provide unique title`});
   
   let finalData = {title,description , price, currencyId, currencyFormat, isFreeShipping, style, availableSizes:[...allSizes], installments,productImage}

   let my= await productModel.create(finalData);
  // console.log(my)
   res.status(201).send({status:true, data:my})


} catch (error) {
    return res.status(500).send({status:false,error:error.message})
    
}
}



//==============================[Get-Product-By-Query]====================================//

const getProducts = async function (req, res) {
    let requestQuery = req.query;
    try {

        let obj = {isDeleted: false}

        let availableSizes = requestQuery.availableSizes;

        if (availableSizes) {
            if (!isValid(availableSizes) && availableSizes.length === 0) {
                return res.status(400).send({ status: false, msg: "Please enter size, ex.-(S, XS, M, X, L, XXL, XL)"})
            } else {
                obj.availableSizes = { $in: availableSizes.split(",") };
            }
        }

        let name = requestQuery.name;
        if (name) {
            if (!isValid(name)) {
                return res.status(400).send({ status: false, mesage: "Please Enter valid name" })
            } else {
                //  $regex is given by mongodb it will return whatever data pattern
                obj.title = { $regex: name };
            }
        }

        let priceGreaterThan = req.query.priceGreaterThan;
        if (priceGreaterThan) {
            if (!isValid(priceGreaterThan)) {
                return res.status(400).send({ status: false, message: "Please Enter price" })
            } else {
                obj.price = { $gte: priceGreaterThan }
            }
        }

        let priceLessThan = req.query.priceLessThan;
        if (priceLessThan) {
            if (!isValid(priceLessThan)) {
                return res.status(400).send({ status: false, msg: "Please Enter the pricelessthan" })
            } else {
                obj.price = { $lte: priceLessThan }
            }
        }

        if (priceGreaterThan && priceLessThan) {
            if (!isValid(priceLessThan)) {
                return res.status(400).send({ status: false, message: "Please Enter price less than" })
            }
            if (!isValid(priceGreaterThan)) {
                return res.status(400).send({ status: false, message: "Please Enter greater price" })

            }

            obj.price = { $lte: priceLessThan, $gte: priceGreaterThan }
        }
      //Sorted By Product Price ==
        let priceSort = requestQuery.priceSort;
        if (priceSort) {
            if (priceSort === "lessToMore") {
                priceSort = 1;
            } else if (priceSort === "moreToLess") {
                priceSort = -1;
            }
        }
        
        let filterProduct = await productModel.find(obj).sort({ price: priceSort })

        if (filterProduct.length == 0) {
            return res.status(400).send({ status: true, message: "No Products Found" });
        }

        return res.status(200).send({ status: true, message: "Products you want", data: filterProduct })


    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}


//================================[Get-Product-By-Id]===============================================//

const getProductById = async function (req, res) {
    try {
        let productId = req.params.productId


        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "Invalid ProductId in params" })
        }

        const getProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!getProduct) {
            return res.status(400).send({ status: false, msg: "No products found or product has been deleted" })
        }

        res.status(200).send({ status: true, msg: 'sucess', data: getProduct })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}



//===============================[Delete-Product-By-Id]===================================//

const deleteProduct = async function (req, res) {
    try {
        let productId = req.params.productId
        console.log(productId)

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Product-Id is not correct OR Invalid Product-Id" })
        }

        let isProductIdDeleted = await productModel.findOne({ _id: productId, isDeleted: true });

        if (isProductIdDeleted) {
            return res.status(400).send({ status: false, message: "This Product is already deleted" })
        }

        let isProductIdPresent = await productModel.findOne({ _id: productId, isDeleted: false });

        if (!isProductIdPresent) {
            return res.status(400).send({ status: false, message: "No product exist with this product Id" })
        }


        let newDeleted = await productModel.findByIdAndUpdate({ _id: productId }, { isDeleted: true, deletedAt: new Date() }, { new: true })

        return res.status(200).send({ status: false, message: "success", data: newDeleted })

    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}




module.exports={productRegister, getProducts, getProductById,deleteProduct}


