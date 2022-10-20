const { trusted } = require("mongoose")
const productModel=require("../models/productModel")
const {isBodyEmpty,isValid,removeSpaces,acceptFileType,isEmpty}=require("../validations/commonValidation")
const {isValidObjectId ,numericValue}=require("../validations/userValidation")

const {checkSizes}=require("../validations/userValidation")
const aws=require("./awsConfig")






// TODO<================================ Product Create ==========================================>

const productRegister=async (req,res)=>{
    try {
        const data=req.body
       console.log(data)
        if(isBodyEmpty(data)) return res.status(500).send({status:false, message:"please provide data"})
        
        let {title, description , price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments,productImage  }=data

        if(!isValid(title)) return res.status(400).send({status:false, message:"Title tag is Required"})
    title = removeSpaces(title) 

    if(!isValid(description)) return res.status(400).send({status:false, message:"Description tag is Required"}) 
   description=removeSpaces(description) 

    if(!isValid(price)) return res.status(400).send({status:false, message:"Price tag is Required"}) 
    if(!numericValue(price)) return res.status(400).send({status:false, message:"price must be a number"}) 
    
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
        if(!numericValue(installments)) return res.status(400).send({status:false, message:"installments must be number"})
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

   res.status(201).send({status:true,message:"Success",data:my,data_id:my._id})


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

        return res.status(200).send({ status: true, message: "Success", data: filterProduct })


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

        res.status(200).send({ status: true,message:"Success", data: getProduct })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

//================================= put api ===================================================>

const updateProduct = async function (req, res) {
    try {
        let productId = req.params.productId;

        let data = req.body;
        let files = req.files;

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data; // destructuring req.body

        //body empty
        if (!data || (Object.keys(data).length == 0 && !files))
            return res.status(400).send({ status: false, message: "Provide Data in Body" });

        //productId validation
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Please provide valid productId" });
        }

        // product is present or not
        let productData = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!productData) {
            return res.status(404).send({ message: "Product is not present" });
        }
        //title unique and other validation
        let newObj = {};

        if (title != null) {
            if (!isValid(title)) {
                return res.status(400).send({ status: false, message: "Provide the title details" });
            }

            if (!/^[a-zA-Z ]{2,30}$/.test(title)) {
                return res.status(400).send({ status: false, message: "Enter a valid title" });
            }

            let titleData = await productModel.findOne({ title: title });
            if (titleData) {
                return res.status(404).send({ message: `${title} is already present` });
            }
            newObj["title"] = title;
        }
        //description validation
        if (description != null) {
            if (!isValid(description)) {
                return res.status(400).send({ status: false, message: "Please write description about product " });
            }

            newObj["description"] = description;
        }

        //price validation
        if (price != null) {
            if (price.length > 0) {
                if (!/^[0-9]*$/.test(price)) {
                    return res.status(400).send({ status: false, message: "price should be in numbers" });
                }

                if (price <= 0) {
                    return res.status(400).send({ status: false, message: "Price can't be zero" });
                }

                newObj["price"] = price;
            } else {
                return res.status(400).send({ status: false, message: "Please Fill The Price as U have selected" });
            }
        }
        //currencyId validation
        if (currencyId != null) {
            if (!isValid(currencyId)) {
                return res.status(400).send({ status: false, message: "Provide the currencyId " });
            }

            if (currencyId != "INR") {
                return res.status(400).send({ status: false, message: "Invalid! CurrencyId should be in INR" });
            }

            newObj["currencyId"] = currencyId;
        }

        //currencyFORMAT validation
        if (currencyFormat != null) {
            if (currencyFormat.length > 0) {
                if (currencyFormat != "₹") {
                    return res.status(400).send({ status: false, message: "Invalid currencyFormat,Only ₹ accepted" });
                }

                newObj["currencyFormat"] = currencyFormat;
            } else {
                return res.status(400).send({ status: false, message: "Provide The Currecny Format as u have Selected " });
            }
        }

        //isFreeshipping validation
        if (isFreeShipping != null) {
            if (!(isFreeShipping.toLowerCase() === "true" || isFreeShipping.toLowerCase() === "false")) {
                return res.status(400).send({ status: false, message: "Please Provide only Boolean Value" });
            }

            newObj["isFreeShipping"] = isFreeShipping.toLowerCase();
        }

        //style validation
        if (style != null) {
            if (!isValid(style)) {
                return res.status(400).send({ status: false, message: "Provide the Style " });
            }

            newObj["style"] = style;
        }

        //installments validation
        if (installments != null) {
            if (installments.length > 0) {
                if (!!isNaN(Number(installments))) {
                    return res.status(400).send({ status: false, message: "Please Enter Valid Installments and Should be in Number" });
                }

                if (installments < 0) {
                    return res.status(400).send({ status: false, message: "Installments Shoud be In Valid  Number only" });
                }

                newObj["installments"] = installments;
            } else {
                return res.status(400).send({ status: false, message: "Installments can't be null as u have selected", });
            }
        }

        //availableSizes validation
        if (availableSizes != null) {
            let sizeArr = availableSizes.replace(/\s+/g, "").split(",").map(String);
            //console.log(sizeArr) returns the new updated size element in a array 
            let arrNew = ["S", "XS", "M", "X", "L", "XXL", "XL"];
            let flag;
            for (let i = 0; i < sizeArr.length; i++) {
                flag = arrNew.includes(sizeArr[i]);
            }

            if (flag == false) {
                return res.status(400).send({
                    status: false,
                    data: "Enter a Valid Size, Like 'XS or S or M or X or L or XL or XXL'",
                });
            }
            // newObj["availableSizes"] = availableSizes;

            //checking for already present
            let arr = productData.availableSizes;
            for (let i = 0; i < arr.length; i++) {
                if (arr.includes(sizeArr)) {
                    return res.status(404).send({ status: false, message: `This ${sizeArr} size is Already Present ` });
                }
            }
        }

        //profile image validation
        if (files) {
            if (files == null) {
                return res.status(400).send({ status: false, message: "Provide the Product Image as u have selected" });
            }

            if (files && files.length > 0) {
                if (!isValidImg(files[0].mimetype)) {
                    return res.status(400).send({ status: false, message: "Image Should be in 'JPEG/ JPG/ PNG' format" });
                }

                //store the profile image in aws and creating profile image url via "aws package" 
                let uploadedFileURL = await uploadFile(files[0]);
                newObj["productImage"] = uploadedFileURL;
            }
        }

        //updation part
        const updateProduct = await productModel.findByIdAndUpdate(
            { _id: productId },
          
            { $set: newObj, $push: { availableSizes: availableSizes } },
            { new: true }
        );
        return res.status(200).send({ status: true, message: "Product updated", data: updateProduct });
    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
};



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

        return res.status(200).send({ status:true, message: "Success", data: newDeleted })

    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}




module.exports={productRegister, getProducts, getProductById,updateProduct,deleteProduct}


