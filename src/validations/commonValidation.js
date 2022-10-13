
const isBodyEmpty = function(data)
{
    if(Object.keys(data).length == 0) return true
    return false;
}

// 
const isValid = function(value)
{
    if(typeof value === 'undefined' || value === null ) return false
    if(typeof value === 'string' && value.trim().length === 0) return false 
    return true;
}


// verify fname lname 
const regex = /[`/\d/!@#$%^&*()_+\=\[\]{};':"\\|.<>\/?~]/
const isVerifyString = function (string) {
    return regex.test(string)
};

// Mobile no regex
const regEx=/^[6-9]\d{9}$/
const isValidMobileNo = function(mobno)
{
    return regEx.test(mobno)
}

const isValidPincode = function (pincode) {
    const pattern = /^[1-9]{1}[0-9]{2}\s?[0-9]{3}$/;
    return pattern.test(pincode); // returns a boolean
  };


// aws-link is valid or not
const isValidS3Url = function(url)
{
    if(/^https?:\/\/.*\/.*\.(png|gif|webp|jpeg|jpg)\??.*$/gmi.test(url))
    {
        return true;
    }
    else return false;
}


const acceptFileType = (file, ...types) => {
    console.log(file.mimetype);
    return types.indexOf(file.mimetype) !== -1 ? true : false
}


let isEmpty = function (value) {
    if(!value) return true
    if (typeof value === 'undefined' || value === null) return true;
    if (value.trim().length === 0) return true;
    return false;
}

let isValidJSONstr = (json) => {
    try {
        return JSON.parse(json)
    } catch (_) {
        return false
    }
}



function removeSpaces(a){
    return a.split(" ").filter((b)=> b ).join(" ")
}


let validateEmail = (email) => {
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};

module.exports={isBodyEmpty,isValid,isVerifyString,isValidMobileNo,isValidPincode,isValidS3Url,isEmpty,isValidJSONstr,removeSpaces,validateEmail,acceptFileType}