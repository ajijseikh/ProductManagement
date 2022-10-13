const express = require('express');
const mongoose = require('mongoose');
const router = require('./routes/router')
const multer= require("multer");

const app  = express();



app.use(express.json())

app.use( multer().any())

// const url="";
mongoose.connect("mongodb+srv://ajij:7pt2AejwcFh1o56K@cluster0.dwd5pcx.mongodb.net/test",{useNewUrlParser: true})
.then(()=>console.log("MongoDb is Connected"))
.catch(err=>console.log(err))

app.use('/',router);

app.listen(process.env.PORT || 3000, function (){
    console.log('Server Started On : '+3000)
})