const express = require('express');
const mongoose = require('mongoose');
const router = require('./routes/router')
const multer= require("multer");

const app  = express();



app.use(express.json())

app.use( multer().any())

// const url="";
mongoose.connect("mongodb+srv://plutonium-batch:CD0Y7Vi1xxgIRocV@cluster0.78bw9.mongodb.net/test",{useNewUrlParser: true})
.then(()=>console.log("MongoDb is Connected"))
.catch(err=>console.log(err))

app.use('/',router);

app.listen(process.env.PORT || 3000, function (){
    console.log('Server Started On : '+3000)
})