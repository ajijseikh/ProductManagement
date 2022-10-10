const express = require('express');
const mongoose = require('mongoose');
const router = require('./routes/route')
const multer= require("multer");

const app  = express();



app.use(express.json())

app.use( multer().any())

const url="";
mongoose.connect(url,{useNewUrlParser: true})
.then(()=>console.log("MongoDb is Connected"))
.catch(err=>console.log(err))

app.use('/',router);

app.listen(process.env.PORT || 3000, function (){
    console.log('Server Started: '+3000)
})