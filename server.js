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
const mysql = require('mysql');//used connect to mysql db

const app=express();
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
const path=__dirname + '/public';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.listen(3000,function(){
    console.log("Cadenza is live on 3000")
});

//MYSQL connection
const pool=mysql.createPool({
    connectionLimit : 10,
    host            :'localhost',
    user            :'root',
    password        :'',
    database        :'testcadenza'
})

//Get all data
pool.getConnection((err, connection) => {
    if(err) throw err
    console.log("connected as id "+connection.threadId);
    
    //query(sqlString,callback)

    // connection.query('SELECT * from LOGIN_DETAILS', (err,rows)=>{
    //     connection.release() //return the connection to pool

    //     if(!err){
    //         console,console.log(rows);
    //     }else{
    //         console.log(err);
    //     }
    // })
})

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
            pool.getConnection((err, connection) => {
                if(err) throw err
                console.log("insertion at "+connection.threadId);
                    connection.query('INSERT into login_details (email,password,fullname,number,premium) values (?);',[[req.body.email,req.body.password,req.body.fullName,req.body.phNumber,premium]], (err,rows)=>{
                        connection.release() //return the connection to pool
    
                        if(!err ){
                            // console.log(rows[0].password)s
                            res.status(201).sendFile(path+"/login.html");
                        }else{
                            res.send(err)
                        }
                    })
                })
        }else{
            res.send("passwords are not same");
        }
    }catch(e){
        res.status(400).send(e);
    }
});


function containsOnlyNumbers(str) {
    return /^[0-9]+$/.test(str);
  }



app.post("/music",async function(req,res){//login verification
    try{
        let useremail;
        const email=req.body.email;
        const password=req.body.password;
        pool.getConnection((err, connection) => {
            if(err) throw err
            console.log("check credentials at "+connection.threadId);
            if(containsOnlyNumbers(email)){
                connection.query('SELECT * from LOGIN_DETAILS WHERE number = ?',[req.body.email], (err,rows)=>{
            
                    if(rows[0] == undefined){
                        res.send("invalid email or password")
                    }
                    app.set('view engine', 'hbs') //view engine for handlebars page
                    if(!err && rows[0].password==password ){
                        // console.log(rows[0].password)s
                        connection.query('SELECT * from artist',[req.body.email], (err,rows)=>{
                            connection.release() //return the connection to pool
                            console.log(rows);
                    
                            app.set('view engine', 'hbs') //view engine for handlebars page
                                res.status(201).render(path+"/topmusicnew.hbs",{artist:JSON.parse(JSON.stringify(rows))});
                        })
                    }else{
                        res.send("invalid email or password")
                    }
                })
            }
            else{
                connection.query('SELECT * from LOGIN_DETAILS WHERE email = ?',[req.body.email], (err,rows)=>{
                    connection.release() //return the connection to pool
                    
                    if(rows[0] == undefined){
                        res.send("invalid email or password")
                    }
                    app.set('view engine', 'hbs') //view engine for handlebars page
                    if(!err && rows[0].password==password ){
                        // console.log(rows[0].password)s
                        res.status(201).sendFile(path+"/topmusicnew.html");
                    }else{
                        res.send("invalid email or password")
                    }
                })
            }
        });
    }catch(error){
            res.status(400).send("invalid email or password "+error);
        }

});

app.set('view engine', 'hbs') //view engine for handlebars page

app.post('/getmusicglobal', async function(req,res){
    try{
        app.set('view engine', 'hbs') //view engine for handlebars page
        console.log(req.body.songname)
        pool.getConnection((err, connection) => {
            if(err) throw err
            console.log("connected as id "+connection.threadId);
                connection.query('SELECT * from SONGS', (err,rows)=>{
                    connection.release() //return the connection to pool
                    console.log(rows)
                    console.log(JSON.parse(JSON.stringify(rows)));
                    let row=JSON.parse(JSON.stringify(rows));
                    res.status(200).render(path+'/songs.hbs',{song:row})
                })
        })
    }catch(err){
        console.log("error: "+err)
    }
})

app.post('/getmusicindia', async function(req,res){
    try{
        app.set('view engine', 'hbs') //view engine for handlebars page
        console.log(req.body.songname)
        pool.getConnection((err, connection) => {
            if(err) throw err
            console.log("connected as id "+connection.threadId);
                connection.query('SELECT * from SONGS', (err,rows)=>{
                    connection.release() //return the connection to pool
                    console.log(rows)
                    console.log(JSON.parse(JSON.stringify(rows)));
                    let row=JSON.parse(JSON.stringify(rows));
                    res.status(200).render(path+'/songs.hbs',{song:row})
                })
        })
    }catch(err){
        console.log("error: "+err)
    }
})

app.post('/getmusictrend', async function(req,res){
    try{
        app.set('view engine', 'hbs') //view engine for handlebars page
        console.log(req.body.songname)
        pool.getConnection((err, connection) => {
            if(err) throw err
            console.log("connected as id "+connection.threadId);
                connection.query('SELECT * from SONGS', (err,rows)=>{
                    connection.release() //return the connection to pool
                    console.log(rows)
                    console.log(JSON.parse(JSON.stringify(rows)));
                    let row=JSON.parse(JSON.stringify(rows));
                    res.status(200).render(path+'/songs.hbs',{song:row})
                })
        })
    }catch(err){
        console.log("error: "+err)
    }
})