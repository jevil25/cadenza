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
app.use(express.static(__dirname+'/public'));
app.use(cookieParser());
const path=__dirname + '/public';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(sessions({ //this the data sent and stored in brower cookie
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: 24*60*60*1000 },
    resave: false 
}));

app.listen(3000,function(){
    console.log("Cadenza is live on 3000")
});

//MYSQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',    
    database: 'testcadenza'
})
db.connect ((err) =>{
    if(err){
        throw err;
    }
    console.log('SQL Connected')
});

function home(res,req){
    db.query('SELECT * from artist', (err,rows)=>{
        // console.log(rows);
        console.log(req.session.userid);
        db.query('SELECT * from login_details where email='+req.session.userid+' or number='+req.session.userid+';',[req.session.userid], (err,rows1)=>{
            // console.log(rows);
            if(!err){
                app.set('view engine', 'hbs') //view engine for handlebars page
                console.log(JSON.parse(JSON.stringify(rows1)));
                res.status(201).render(path+"/topmusicnew.hbs",{artist:JSON.parse(JSON.stringify(rows)),login:JSON.parse(JSON.stringify(rows1))});
            }else{
                console.log(err)
            }
        })
    })
}

app.get('/',function(req,res){ 
    if(req.session.userid){
        home(res,req);
    }else{
        res.sendFile(path+"/main.html")
    }
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
                    db.query('INSERT into login_details (email,password,fullname,number,premium) values (?);',[[req.body.email,req.body.password,req.body.fullName,req.body.phNumber,premium]], (err,rows)=>{
                         //return the connection to pool
    
                        if(!err ){
                            // console.log(rows[0].password)s
                            res.status(201).sendFile(path+"/login.html");
                        }else{
                            res.send(err)
                        }
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
            if(containsOnlyNumbers(email)){
            db.query('SELECT * from LOGIN_DETAILS WHERE number = ?',[req.body.email], (err,rows)=>{
        
                if(rows[0] == undefined){
                    res.send("invalid email or password")
                }
                app.set('view engine', 'hbs') //view engine for handlebars page
                if(!err && rows[0].password==password ){
                    // console.log(rows[0].password)s
                    req.session.userid=req.body.email;
                    home(res,req);
                }else{
                    res.send("invalid email or password")
                }
            })
        }
        else{
            db.query('SELECT * from LOGIN_DETAILS WHERE email = ?',[req.body.email], (err,rows)=>{
                
                if(rows[0] == undefined){
                    res.send("invalid email or password")
                }
                app.set('view engine', 'hbs') //view engine for handlebars page
                if(!err && rows[0].password==password ){
                    // console.log(rows[0].password)s
                    req.session.userid=req.body.email;
                    home(res,req);
                }else{
                    res.send("invalid email or password")
                }
            })
        }
    }catch(error){
            res.status(400).send("invalid email or password "+error);
        }

});

app.set('view engine', 'hbs') //view engine for handlebars page

app.post('/getmusicglobal', async function(req,res){
    try{
        app.set('view engine', 'hbs') //view engine for handlebars page
        // console.log(req.body.songname)
            db.query('SELECT song_name,artist_name,genre_name from SONGS S,GENRE G,ARTIST A where S.genre_id=G.genre_id and A.artist_id=S.artist_id and s.chart_id=1;', (err,rows)=>{
                 //return the connection to pool
                // console.log(rows)
                // console.log(JSON.parse(JSON.stringify(rows)));
                let row=JSON.parse(JSON.stringify(rows));
                res.status(200).render(path+'/songs.hbs',{song:row})
            })
    }catch(err){
        console.log("error: "+err)
    }
})

app.post('/getmusicindia', async function(req,res){
    try{
        app.set('view engine', 'hbs') //view engine for handlebars page
        // console.log(req.body.songname)
            db.query('SELECT song_name,artist_name,genre_name from SONGS S,GENRE G,ARTIST A where S.genre_id=G.genre_id and A.artist_id=S.artist_id  and s.chart_id=2', (err,rows)=>{
                 //return the connection to pool
                // console.log(rows)
                // console.log(JSON.parse(JSON.stringify(rows)));
                let row=JSON.parse(JSON.stringify(rows));
                res.status(200).render(path+'/songs.hbs',{song:row})
            })
    }catch(err){
        console.log("error: "+err)
    }
})

app.post('/getmusictrend', async function(req,res){
    try{
        app.set('view engine', 'hbs') //view engine for handlebars page
        // console.log(req.body.songname)
            db.query('SELECT song_name,artist_name,genre_name from SONGS S,GENRE G,ARTIST A where S.genre_id=G.genre_id and A.artist_id=S.artist_id  and s.chart_id=3', (err,rows)=>{
                 //return the connection to pool
                // console.log(rows)
                // console.log(JSON.parse(JSON.stringify(rows)));
                let row=JSON.parse(JSON.stringify(rows));
                res.status(200).render(path+'/songs.hbs',{song:row})
            })
    }catch(err){
        console.log("error: "+err)
    }
})

app.post('/playmusic',async function(req,res){
    try{
        // console.log(req.body.songname)
            db.query("SELECT song_name,song_link,artist_name,song_pic_link,language,song_id from SONGS S, ARTIST A where song_name=? and S.artist_id=A.artist_id;",[req.body.songname], (err,rows)=>{
                 //return the db to pool
                // console.log(rows)
                console.log(JSON.parse(JSON.stringify(rows)));
                let row=JSON.parse(JSON.stringify(rows));
                res.render(path+"/music.hbs",{song:row})
            })
    }catch(err){
        console.log(err);
    }
})

app.post('/newsong',async function(req,res){
    try{
        db.query("SELECT song_name,song_link,artist_name,song_pic_link,language from SONGS S, ARTIST A where S.artist_id=A.artist_id order by rand() limit 1;", (err,rows)=>{
             //return the connection to pool
            // console.log(rows)
            // console.log(JSON.parse(JSON.stringify(rows)));
            let row=JSON.parse(JSON.stringify(rows));
            res.render(path+"/music.hbs",{song:row})
        })
    }catch(err){
        console.log(err);
    }
})

app.post("/getlyrics",async function(req,res){
    try{
    db.query('SELECT lyrics,song_name from lyrics L,songs S where L.song_id=? and L.song_id=S.song_id',[req.body.id], (err,rows)=>{
        //return the connection to pool
       // console.log(rows)
       console.log(JSON.parse(JSON.stringify(rows)));
       let row=JSON.parse(JSON.stringify(rows));
       app.set('view engine', 'hbs');
       res.status(200).render(path+"/lyrics.hbs",{song:row})
   })
}catch(err){
    console.log("error: "+err)
}
})

app.post('/getmusicartist', async function(req,res){
    try{
        app.set('view engine', 'hbs') //view engine for handlebars page
        // console.log(req.body.songname)
        db.query('SELECT song_name,artist_name,genre_name from SONGS S,GENRE G,ARTIST A where S.genre_id=G.genre_id and A.artist_id=S.artist_id  and s.artist_id=?',[req.body.artistid], (err,rows)=>{
             //return the connection to pool
            // console.log(rows)
            // console.log(JSON.parse(JSON.stringify(rows)));
            let row=JSON.parse(JSON.stringify(rows));
            res.status(200).render(path+'/songs.hbs',{song:row})
        })
    }catch(err){
        console.log("error: "+err)
    }
})

app.post("/home",function(req,res){
    home(res,req);
})

app.post("/logout",function(req,res){
    req.session.destroy();
    res.sendFile(path+"/main.html");
})
