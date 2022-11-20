//packages
const express = require("express"); //interact with html file
const bodyParser=require("body-parser"); //to get data from user
const mongoose=require("mongoose"); //package to connect to db
const bcrypt=require("bcryptjs");//package to hash the password (one way)
const multer = require('multer');//package to upload and fetch images
const fs=require("fs");//package to read files given by the user
const hbs=require("express-handlebars");//used for hbs file soo as to use js componenets for displaying images
// let global_id;//used to store id to retrieve images
const {execSync} = require('child_process');//used to cause delays and sleeps
const cookieParser = require("cookie-parser");//used to store cookies for user sessions
const sessions = require('express-session');//used to create sessions

mongoose.connect("mongodb+srv://jevil2002:aaron2002@jevil257.lipykl5.mongodb.net/cadenza",{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    //useCreateIndex:true
}).then(()=>{
    console.log("connection sucessfull");
}).catch((e)=>{
    console.log(e);
});
const { response } = require("express");
//db declaration
const regSchema=new mongoose.Schema({
    fullname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    number:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    premium:{
        type:String
    }
});

regSchema.pre("save",async function(next){
    this.password= await bcrypt.hash(this.password,10);
    next();
});

const Register = new mongoose.model("Project", regSchema);

module.exports={Register}; //sends data to database

const app=express();
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
const path=__dirname + '/public';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.listen(3000,function(){
    console.log("server is live on 3000")
});

app.get('/',function(req,res){ 
    res.sendFile(path+"/index.html");
});

app.post('/signup', async function(req,res){
    try{
        const password=req.body.password;
        const confirmpassword=req.body.confirm;
        if(password===confirmpassword){
            if(req.body.Premium!="premium"){
                const premium=0;
            }
            const premium=req.body.Premium;
            const register1= new Register({
            fullname:req.body.fullName,
            email:req.body.email,
            number:req.body.phNumber,
            password:password,
            premium:premium
            })
            const registered=await register1.save();
            res.status(201).sendFile(path+"/topmusic.html");
        }else{
            res.send("passwords are not same");
        }
    }catch(e){
        res.status(400).send(e);
    }
});

app.post("/music",async function(req,res){//login verification
    try{
        const email=req.body.email;
        const password=req.body.password;
        const useremail=await Register.findOne({email:email});
        const verify=await bcrypt.compare(password,useremail.password);
        if(verify){
            res.status(201).sendFile(path+"/topmusic.html");
        }else{
            res.send("invalid email or password")
        }
    }catch(error){
        res.status(400).send("invalid email or password");
    }
});