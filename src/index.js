const express = require('express');
const mongoose = require('mongoose');
const router = require('./routes/router')
const multer= require("multer");

const app  = express();



app.use(express.json())

app.use( multer().any())

<<<<<<< HEAD
const url="mongodb+srv://ajij:7pt2AejwcFh1o56K@cluster0.dwd5pcx.mongodb.net/test";
mongoose.connect(url,{useNewUrlParser: true})
=======
// const url="";
mongoose.connect("mongodb+srv://plutonium-batch:CD0Y7Vi1xxgIRocV@cluster0.78bw9.mongodb.net/test",{useNewUrlParser: true})
>>>>>>> d3a297eb9b193ff05cec0ef803bbb9cb2793d63e
.then(()=>console.log("MongoDb is Connected"))
.catch(err=>console.log(err))

app.use('/',router);

app.listen(process.env.PORT || 3000, function (){
    console.log('Server Started On : '+3000)
})