
const userModel=require("../models/userModel");

const aws = require('./awsConfig')
const bcrypt = require('bcrypt')
const saltRounds = 10;



const {isBodyEmpty,isValidS3Url,validateEmail, isValid, isValidMobileNo, isVerifyString,isValidJSONstr,isEmpty}=require('../validations/commonValidation')

const {isValidRequest, isValidAddress, isValidFile, isValidObjectId, isValidPhone, isValidPassword, isValidString, isValidEmail, isValidPincode, removeSpaces, isValidFiles} = require('../validations/userValidation')
//TODO<============================ Create User Api =============================================>

const createUser= async (req,res)=>{
    try {
    //     
          const data =req.body
       //  console.log(data)
        if(!data){
            return res.status(400).send({ status: false, message: "Please provide data" })
        }
        const { fname, lname, email, phone, password, address } = data
      // console.log(fname)

        if (!isValid(fname)) return res.status(400).send({ status: false, message: "fname tag is required" })
        if (isVerifyString(fname)) return res.status(400).send({ status: false, message: "Please provide valid fname" })

        if (!isValid(lname)) return res.status(400).send({ status: false, message: "lname tag is required" })
        if (isVerifyString(lname)) return res.status(400).send({ status: false, message: "Please provide valid lname" })

        if (!isValid(email)) return res.status(400).send({ status: false, message: "email tag is required" })
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "Please provide valid email" })

        if (!isValid(phone)) return res.status(400).send({ status: false, message: "phone tag is required" })
        if (!isValidMobileNo(phone)) return res.status(400).send({ status: false, message: "Please provide valid Mobile Number" })

        if (!isValid(password)) return res.status(400).send({ status: false, message: "password field is required" })


        if(!isValidPassword(password)) return res.status(400).send({status:false, message: "please enter valid password length should be between 8-15, one uppercase, one lowercase, one digit, one special character"})

        

        let parseAddress=null;

        if(!address || address == ''){
            res.status(400).send({status:false, message:"Address is required"})
        }
        try{
         parseAddress = JSON.parse(address)
        }catch(err){
           return res.status(400).send({status:false, message:"address is not in JSON or may be Pincode Invalid"})
        }
        

       // console.log(parseAddress.shipping)
        if(parseAddress){
            if(parseAddress.shipping != undefined){
                if(!isValid(parseAddress.shipping.street)) return  res.status(400).send({status:false,message:"street tag is required"})
                if(!isValid(parseAddress.shipping.city)) return  res.status(400).send({status:false,message:"city tag is required"})
                if(isVerifyString(parseAddress.shipping.city)) return res.status(400).send({status:false,message:"Please provide a valid city name"})
               
                if(!isValid(parseAddress.shipping.pincode)) return res.status(400).send({status:false,message:"pincode tag is required"})
                
                if(!isValidPincode(parseAddress.shipping.pincode)) return res.status(400).send({status:false,message:"Please provide a valid pincode"})
                    
            }
            else{
                if(!isValid(parseAddress.shipping)) return  res.status(400).send({status:false,message:"Please provide shipping address"})  
            }
            if(parseAddress.billing != undefined){
                if(!isValid(parseAddress.billing.street)) return  res.status(400).send({status:false,message:"street tag is required"})

                if(!isValid(parseAddress.billing.street)) return  res.status(400).send({status:false,message:"street tag is required"})
                if(!isValid(parseAddress.billing.city)) return  res.status(400).send({status:false,message:"city tag is required"})
                if(isVerifyString(parseAddress.billing.city)) return res.status(400).send({status:false,message:"Please provide a valid city name"})
                if(!isValid(parseAddress.billing.pincode)) return res.status(400).send({status:false,message:"pincode tag is required"})
                if(!isValidPincode(parseAddress.billing.pincode)) return res.status(400).send({status:false,message:"Please provide a valid pincode"})

            }
            else{
                if(!isValid(parseAddress.billing)) return  res.status(400).send({status:false,message:"Please provide billing address"})


            }
        }
   

        const isEmailExist = await userModel.findOne({ email: email })
        if (isEmailExist) return res.status(409).send({ status: false, message: "email is already exist" })
        const isPhoneExist = await userModel.findOne({ phone: phone })
        if (isPhoneExist) return res.status(409).send({ status: false, message: "phone is already exist" })

        // files aws 
        let files = req.files;
        //console.log(files)
        if (isValidFiles(files)){
           return  res.status(400).send({status:false, message:"profileImage is Required"})
        }
      
        let profilePicture = await aws.uploadFile(files[0])
       //  console.log(profilePicture)
        
       // const saltRounds = 10;
        const encryptedPassword = await bcrypt.hash(password, saltRounds)
       // console.log(encryptedPassword)
        const userrequestBody = { fname, lname, email, phone, profileImage: profilePicture, password: encryptedPassword , address:parseAddress}

          const newUser = await userModel.create(userrequestBody);

        res.status(201).send({
            status: true,
            message: "User created successfully",
            data: newUser
        });



        
    } catch (error) {
        return res.status(500).send({status:false,message:error.message})
    }
}

module.exports.createUser=createUser

// TODO ================================= get api ================================================
const getUser = async (req, res) => {
    try {
        let userId = req.params.userId;

        //userId validation
        if (!userId) {
            return res.status(400).send({ status: false, message: "Provide UserID" });
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ stauts: false, message: "Invalid User Id" });
        }

       
        const data = await userModel.find({ _id: userId });
        if (data) {
            return res.status(200).send({ status: true, message: 'Success', data: data });
        } else {
            return res.status(404).send({ status: false, message: `No Data Found by This Id ${userId}` });
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

module.exports.getUser=getUser


//===================================================[USER UPDATE API ==========================//
const UpdateUser = async function (req, res) {
    try{

       
    let data = req.body;
    const userId = req.params.userId

    //Validations Starts-

    const { fname, lname, email, phone, password, address, profileImage } = data

    const updatedData = {}

    //fname validation
    if (fname) {
        if (!isValid(fname)) {
            return res.status(400).send({ status: false, Message: "First name is required" })
        }
        if (isVerifyString(fname)) return res.status(400).send({ status: false, message: "Please provide valid fname" })
        updatedData.fname = fname
    }

    //lname validation-
    if (lname) {
        if (!isValid(lname)) {
            return res.status(400).send({ status: false, Message: "Last name is required" })
        }
        if (isVerifyString(lname)) return res.status(400).send({ status: false, message: "Please provide valid lname" })
        updatedData.lname = lname
    }

    //email validation-
    if(email){
    if (!isValid(email)) return res.status(400).send({ status: false, message: "email tag is required" })
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "Please provide valid email" })

        const isEmailUsed = await userModel.findOne({ email: email })
        if (isEmailUsed) {
            return res.status(400).send({ status: false, msg: "Email must be unique" })
        }
        updatedData.email = email
    
    }

    //profile pic upload and validation-

    // let saltRounds = 10
    if(profileImage){
    const files = req.files

    if (isValidFiles(files)) {
        const profilePic = await aws.uploadFile(files[0])

        updatedData.profileImage = profilePic

    }
}

    //phone validation-
    if(phone){
    if (!isValid(phone)) return res.status(400).send({ status: false, message: "phone tag is required" })
        if (!isValidMobileNo(phone)) return res.status(400).send({ status: false, message: "Please provide valid Mobile Number" })

        const isPhoneUsed = await userModel.findOne({ phone: phone })
        if (isPhoneUsed) {
            return res.status(400).send({ status: false, msg: "Phone Number must be unique" })
        }
        updatedData.phone = phone
    }

    //password validation-
    if(password){
    if (!isValid(password)) return res.status(400).send({ status: false, message: "password field is required" })


    if(!isValidPassword(password)) return res.status(400).send({status:false, message: "please enter valid password length should be between 8-15, one uppercase, one lowercase, one digit, one special character"})

    const encryptPassword = await bcrypt.hash(password, saltRounds)

        updatedData.password = encryptPassword
    }


    //address validation-

    if (address) {

        if (address.shipping) {

            if (!isValid(address.shipping.street)) {
                return res.status(400).send({ status: false, Message: "Street name is required in shipping address" })
            }
            updatedData["address.shipping.street"] = address.shipping.street


            if (!isValid(address.shipping.city)) {
                return res.status(400).send({ status: false, Message: "City name is required in shipping address" })
            }
            updatedData["address.shipping.city"] = address.shipping.city

            if (!isValid(address.shipping.pincode)) {
                return res.status(400).send({ status: false, Message: "Pincode is required in shipping address" })
            }
            updatedData["address.shipping.pincode"] = address.shipping.pincode

        }

        if (address.billing) {
            if (!isValid(address.billing.street)) {
                return res.status(400).send({ status: false, Message: "Please provide street name in billing address" })
            }
            updatedData["address.billing.street"] = address.billing.street

            if (!isValid(address.billing.city)) {
                return res.status(400).send({ status: false, Message: "Please provide city name in billing address" })
            }
            updatedData["address.billing.city"] = address.billing.city

            if (!isValid(address.billing.pincode)) {
                return res.status(400).send({ status: false, Message: "Please provide pincode in billing address" })
            }
            updatedData["address.billing.pincode"] = address.billing.pincode
        }
    }

    //update data-

    const updatedUser = await userModel.findOneAndUpdate({ _id: userId }, updatedData, { new: true })

    return res.status(200).send({ status: true, message: "User profile updated", data: updatedUser });
    }
    catch(err){
        return res.status(500).send({status:false,msg:err.message})
    }
}

module.exports.UpdateUser=UpdateUser









