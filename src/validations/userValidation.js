const mongoose = require("mongoose");


const isValidRequest = function (value) {
    if (Object.keys(value).length == 0 ) return false
    return true
}

const isValidObjectId = function (value) {
    let ObjectId = mongoose.Types.ObjectId
    return ObjectId.isValid(value)
}


function isValidFile(x) {
    const regEx = /\.(gif|jpe?g|tiff?|png|webp|bmp|jpeg)$/i
    return regEx.test(x[0].originalname) // x is array of object so
}

function isValidString(x){
    if(typeof x != "string") return false;
    const regEx = /^\s*[a-zA-Z]+(\.[a-zA-Z\s]+)*[a-zA-Z\s]\s*$/;
    console.log(regEx.test(x)) 
    return regEx.test(x)
}

function removeSpaces(x){
    return x.split(" ").filter((y)=> y ).join(" ")
}

function isValidEmail(x){
    const regEx = /^\s*[a-zA-Z][a-zA-Z0-9]*([-\.\_\+][a-zA-Z0-9]+)*\@[a-zA-Z]+(\.[a-zA-Z]{2,5})+\s*$/;
    return regEx.test(x)
}

function isValidPhone(x){
    if(typeof x !== "string") return false         
    const regEx = /^\s*[6789][0-9]{9}\s*$/;
    return regEx.test(x);
}

function isValidPassword(x){
    const regEx = /^\s*(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,15}\s*$/    ;
    return regEx.test(x);
}

function isValidAddress(x){
   
    const regEx = /^\s*(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,100}\s*$/ 
    return regEx.test(x);
}

function isValidPincode(x){
    const regEx = /^\s*[123456789][0-9]{5}\s*$/
    return regEx.test(x);
}

const isValidSize = (Size) => {
    let correctSize = ["S", "XS", "M", "X", "L", "XXL", "XL"]
    return (correctSize.includes(Size))
  }

  const isValidStatus = (status) => {
    let correctStatus = ['pending', 'completed', 'cancled']
    return (correctStatus.includes(status))
}

const isValidFiles=(files)=>{
    if(files && files.length>0)
    return true
}


let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"];
let checkSizes = async function (allSizes){
    for(let i=0;i<allSizes.length;i++){
        allSizes[i]=allSizes[i].trim();
      if(!arr.includes(allSizes[i])) return false
    }
    return true;
   }


   let arr1=["pending","completed","canceled"]
   let checkStatus =function (arr12){
    for(let i=0;i<arr1.length;i++){
        arr1[i]=arr1[i].trim()
        if(!arr12.includes(arr1[i])) return false
   }
   return true
   }
   let numericValue = function (input) {
	var RE = /^-{0,1}\d*\.{0,1}\d+$/;
	return (RE.test(input));
}

module.exports = {isValidRequest, isValidStatus,isValidAddress, isValidSize, isValidFile, isValidObjectId, isValidPhone, isValidPassword, isValidString, isValidEmail, isValidPincode, removeSpaces,isValidFiles,checkSizes,checkStatus,numericValue }


