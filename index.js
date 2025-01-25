const express=require('express');
const getData = require('./scheduler/firebase_scheduler');
const app=express();
 

getData();
app.get("/",(req,res)=>{
    res.send({
        "isSucess":false
    });
})

app.listen(3000,()=>{
    console.log("Listening to port 3000");
})