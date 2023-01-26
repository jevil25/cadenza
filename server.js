//packages
const express = require("express"); //interact with html file
const bodyParser=require("body-parser"); //to get data from user
const multer = require('multer');//package to upload and fetch images
// const fs=require("fs");//package to read files given by the user
const hbs=require("express-handlebars");//used for hbs file soo as to use js componenets for displaying images
// let global_id;//used to store id to retrieve images
const cookieParser = require("cookie-parser");//used to store cookies for user sessions
// const sessions = require('express-session');//used to create sessions
const mysql = require('mysql2');//used connect to mysql db
// const redis = require("redis");
// const RedisStore = require('connect-redis')(sessions);
const cors=require('cors');
const Redis = require('ioredis');
// const check=0;

const app=express();
app.use(express.static(__dirname+'/public'));
app.use(cookieParser());
const path=__dirname + '/public';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// require('dotenv').config()

var server_port = process.env.YOUR_PORT || process.env.PORT || 3000;
var server_host = process.env.YOUR_HOST || '0.0.0.0';
app.listen(server_port, server_host, function() {
    console.log('Cadenza is live on %d', server_port);
});

// app.use(sessions({ //this the data sent and stored in brower cookie
//     secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
//     saveUninitialized:true,
//     cookie: { expires: 7*24*60*60*1000 },
//     resave: false 
// }));

const { promisifyAll } = require('bluebird');

const endpoint = process.env.REDIS_ENDPOINT_URL || "127.0.0.1:6379";
const password = process.env.REDIS_PASSWORD || null;

promisifyAll(Redis);
// Connect to redis at 127.0.0.1 port 6379 no password.
// const client = redis.createClient({
//     host: endpoint,
//     password: password
// });

const client = new Redis({
    host: 'redis-11874.c89.us-east-1-3.ec2.cloud.redislabs.com',
    port: 11874,
    password: 'N7sXBUNN2LWlWa6hjeUaJqkJ05CNIo30'
});

client.on('connect',()=>{
    console.log("connected to redis");
})

//MYSQL connection
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',    
//     port: 3308,
//     database: 'testcadenza'
// })

// // online connection

const db = mysql.createConnection('mysql://sc7j0zlke84i7soof3o0:pscale_pw_rfau708BkR44Evt27iB7d7Mdwh5PNYN1nTxCc7BPfJd@ap-south.connect.psdb.cloud/cadenza?ssl={"rejectUnauthorized":true}')
console.log('Connected to PlanetScale!')

async function getOrSetCache(key, cb){
    const getResult=await client.get(key);
    // console.log(getResult);
    if(getResult){
        return getResult;
    }
    const rs=await cb();
    await client.set(key,rs);
    const getRes=await client.get(key);
    if(getRes){
        return getRes;
    }
}


function home(res,req,cred){
    db.query('SELECT * from artist', (err,rows)=>{
        // console.log(rows);
        // console.log(req.session.userid);
        db.query('SELECT * from login_details where email="'+cred+'" or number="'+cred+'";', (err,rows1)=>{
            // console.log(rows1);
            if(!err){
                app.set('view engine', 'hbs') //view engine for handlebars page
                // console.log(JSON.parse(JSON.stringify(rows1)));
                res.status(201).render(path+"/topmusicnew.hbs",{artist:JSON.parse(JSON.stringify(rows)),login:JSON.parse(JSON.stringify(rows1))});
            }else{
                console.log(err)
            }
        })
    })
}

app.get('/',async function(req,res){ 
    if(req.cookies.email){
        // console.log(req.cookies);
        // console.log(req.cookies.email);
        home(res,req,req.cookies.email);
    }else{
        res.sendFile(path+"/main.html")
    }
});

app.post('/signup', async function(req,res){
    try{
        const password=req.body.password.trim();
        const confirmpassword=req.body.confirm.trim();
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
        email=email.trim();
        password=password.trim();
        if(email=="admin@cadenza.com"){
            db.query('SELECT * from login_details WHERE email = ?',[req.body.email],async (err,rows)=>{
                // console.log(rows);
        
                if(rows.length === 0){
                    res.send("invalid email or password")
                }
                app.set('view engine', 'hbs') //view engine for handlebars page
                // console.log(rows[0].password + password)
                if(!err && rows[0].password==password ){
                    // console.log(rows[0].password)s
                    const cred = await getOrSetCache(req.body.email,() => {
                        return req.body.email;
                    })
                    // console.log(req.session.userid);
                    // home(res,req);
                    admin(res,req,cred);
                }else{
                    res.send("invalid email or password")
                }
            })
        }else if(containsOnlyNumbers(email)){
            db.query('SELECT * from login_details WHERE number = ?',[req.body.email],async (err,rows)=>{
        
                if(rows.length === 0){
                    res.send("invalid email or password")
                }
                app.set('view engine', 'hbs') //view engine for handlebars page
                // console.log(rows[0].password + password)
                if(!err && rows[0].password==password ){
                    // console.log(rows[0].password)s
                    const cred = await getOrSetCache(req.body.email,async () => {
                        return req.body.email;
                    })
                    // console.log(cred);
                    // console.log("!");
                    res.cookie("email",cred);
                    home(res,req,cred);
                }else{
                    res.send("invalid email or password")
                }
            })
        }
        else{
            db.query('SELECT * from login_details WHERE email = ?',[req.body.email],async (err,rows)=>{
                
                if(rows.length === 0){
                    res.send("invalid email or password")
                }
                app.set('view engine', 'hbs') //view engine for handlebars page
                if(!err && rows[0].password==password ){
                    // console.log(rows[0].password)
                    const cred = await getOrSetCache(req.body.email,async () => {
                        return req.body.email;
                    })
                    res.cookie("email",cred);
                    home(res,req,cred);
                    res.cookie("email",cred);
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
            db.query('SELECT song_name,artist_name,genre_name from songs S,genre G,artist A where S.genre_id=G.genre_id and A.artist_id=S.artist_id and S.chart_id=1;', (err,rows)=>{
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
            db.query('SELECT song_name,artist_name,genre_name from songs S,genre G,artist A where S.genre_id=G.genre_id and A.artist_id=S.artist_id  and S.chart_id=2', (err,rows)=>{
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
            db.query('SELECT song_name,artist_name,genre_name from songs S,genre G,artist A where S.genre_id=G.genre_id and A.artist_id=S.artist_id  and S.chart_id=3', (err,rows)=>{
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
           getmusic(res,req);
    }catch(err){
        console.log(err);
    }
})

app.post('/newsong',async function(req,res){
    try{
        db.query("SELECT song_id,song_name,song_link,artist_name,song_pic_link,language from songs S, artist A where S.artist_id=A.artist_id order by rand() limit 1;", (err,rows)=>{
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
        // if(req.body.id==""){
        //     req.body.id=song_id;
        // }
        // console.log(req.body.id)
    db.query('SELECT lyrics,song_name,song_link,song_pic_link from lyrics L,songs S where L.song_id=? and L.song_id=S.song_id',[req.body.id], (err,rows)=>{
        //return the connection to pool
    //    console.log(rows)
    //    console.log(JSON.parse(JSON.stringify(rows)));
    if(rows.length === 0){
        db.query('Select * from songs where song_id=?',[req.body.id],(err,rows)=>{
                let row1=JSON.parse(JSON.stringify(rows));
                // console.log(row1);
                if(rows.length != 0){
                    row1[0].song_name=row1[0].song_name+" is unavailable, Sorry for the inconvenience";
                    // console.log(row1[0].song_name);
                }
                app.set('view engine', 'hbs');
                res.status(200).render(path+"/lyrics.hbs",{song:row1})
        })
    }else{
        let row=JSON.parse(JSON.stringify(rows));
        app.set('view engine', 'hbs');
       res.status(200).render(path+"/lyrics.hbs",{song:row})
    }
   })
}catch(err){
    console.log("error: "+err)
}
})

app.post('/getmusicartist', async function(req,res){
    try{
        app.set('view engine', 'hbs') //view engine for handlebars page
        // console.log(req.body.songname)
        // console.log(req.body.artistid);
        db.query('SELECT song_name,artist_name,genre_name from songs S,genre G,artist A where S.genre_id=G.genre_id and A.artist_id=S.artist_id  and S.artist_id=?',[req.body.artistid], (err,rows)=>{
             //return the connection to pool
            // console.log(rows)
            // console.log(JSON.parse(JSON.stringify(rows)));
            db.query('Select artist_info,artist_pic,artist_name from artist where artist_id=?',[req.body.artistid],(err,rows1)=>{
                let row=JSON.parse(JSON.stringify(rows));
                let row1=JSON.parse(JSON.stringify(rows1));
                res.status(200).render(path+'/songs.hbs',{song:row,info:row1});
            });
        })
    }catch(err){
        console.log("error: "+err)
    }
})

app.post("/home",async function(req,res){
    home(res,req,req.cookies.email);
})

app.post("/logout",function(req,res){
    res.clearCookie('email');
    client.del(req.cookies.email);
    res.sendFile(path+"/main.html");
})

app.post("/search",function(req,res){
    // console.log(req.body.songname)
    getmusic(res,req);
})

app.post("/delete",function(req,res){
    // console.log(req.body.songname);
    db.query("delete from songs where song_name=?;",[req.body.songname], (err,rows)=>{
        // console.log(rows);
        const cred = getOrSetCache(req.body.email,() => {
            return req.body.email;
        })
        admin(res,req,cred);
    })
})

app.post("/addsong",function(req,res){
    res.sendFile(path+"/addSong.html");
})

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
        var ext=file.originalname.substring(file.originalname.lastIndexOf('.'));
      cb(null, file.fieldname+'-'+Date.now()+ext);
    }
  })
  
  var upload = multer({ storage: storage })
  app.use('/uploads',express.static('./public/images/uploads'));

app.post("/added",upload.fields([
    { name: "songpic", maxCount: 1 },
    { name: "artistpic", maxCount: 1 },
    { name: "songfile", maxCount:1 }]),function(req,res){
    let files= req.files
    // console.log(files);
    // console.log(files.songpic[0].destination+"/"+files.songpic[0].filename);
    // console.log(files.songfile[0].destination+"/"+files.songfile[0].filename);
    // console.log(files.artistpic[0].destination+"/"+files.artistpic[0].filename);
    // console.log(req.body.songname);
    // console.log(req.body.artistname);
    // console.log(req.body.songlang);
    // console.log(req.body.genre);
    // console.log(req.body.chart);
    // console.log(req.body.songlyrics);
    // console.log(req.body.songfile);
    // console.log(req.body.songpic);
    // console.log(files.destination+"/"+files.filename)
    db.query("SELECT max(song_id) as songid from songs;",(err,maxsongid)=>{
        db.query("SELECT max(artist_id) as artistid from artist;",(err,maxartistid)=>{
            // console.log(JSON.parse(JSON.stringify(maxartistid))[0].artistid);
            // console.log(JSON.parse(JSON.stringify(maxsongid))[0].songid);
            const song_name=req.body.songname;
            const song_id=JSON.parse(JSON.stringify(maxsongid))[0].songid+1;
            const artist_id=JSON.parse(JSON.stringify(maxartistid))[0].artistid+1;
            var song_link=files.songfile[0].destination+"/"+files.songfile[0].filename;
            song_link = song_link.replace('/public','');
            const genre_id=req.body.genre;
            var song_pic_link=files.songpic[0].destination+"/"+files.songpic[0].filename;
            song_pic_link = song_pic_link.replace('/public','');
            const language=req.body.songlang;
            const chart_id=req.body.chart;
            var artist_pic=files.artistpic[0].destination+"/"+files.artistpic[0].filename;
            artist_pic=artist_pic.replace("/public","");
            // console.log(artist_pic);
            db.query("SELECT EXISTS(SELECT * FROM artist WHERE artist_name=?) as ans;",[req.body.artistname],(err,rowe)=>{
                let ans=JSON.parse(JSON.stringify(rowe));
                // console.log(ans[0].ans);
                if(ans[0].ans==1){
                    db.query('SELECT artist_id FROM artist WHERE artist_name=?;',[req.body.artistname],(err,name)=>{
                        // console.log(name[0].artist_id)
                        db.query("insert into songs values (?);",[[song_name,song_id,name[0].artist_id,song_link,genre_id,song_pic_link,language,chart_id]],(err,final)=>{
                            // console.log(final);
                            db.query("insert into lyrics values(?);",[[song_id,req.body.songlyrics]],(err,finalfinal)=>{
                                // console.log(finalfinal);
                                const cred = getOrSetCache(req.body.email,() => {
                                    return req.body.email;
                                })
                                admin(res,req,cred);
                            })
                        })
                    })
                }else{
                    db.query("insert into songs values (?);",[[song_name,song_id,artist_id,song_link,genre_id,song_pic_link,language,chart_id]],(err,final)=>{
                        // console.log(final);
                        db.query("insert into artist values(?);",[[artist_id,req.body.artistname,artist_pic,req.body.artistlyrics]],(err,artistfinal)=>{
                            // console.log(artistfinal);
                            db.query("insert into lyrics values(?);",[[song_id,req.body.songlyrics]],(err,finalfinal)=>{
                                // console.log(finalfinal);
                                const cred = getOrSetCache(req.body.email,() => {
                                    return req.body.email;
                                })
                                admin(res,req,cred);
                            })
                        })
                    })
                }
            })
        })
    })
})

app.post('/exit',function (req,res){
    db.end();
    req.session.destroy();
    client.end(true);
    // console.log("Connections closed");
})

function getmusic(res,req){
    db.query("SELECT song_name,song_link,artist_name,song_pic_link,language,song_id from songs S, artist A where song_name=? and S.artist_id=A.artist_id;",[req.body.songname], (err,rows)=>{
        //return the db to pool
       // console.log(rows)
    //    console.log(JSON.parse(JSON.stringify(rows)));
        // db.query("select song_name from songs",(err,rows1)=>{
            let row=JSON.parse(JSON.stringify(rows));
            // console.log(row1);
            // song_id=row.song_id;
            res.render(path+"/music.hbs",{song:row})
   })
}

function admin(res,req,cred){
    db.query('SELECT song_name,artist_name,genre_name from songs S,genre G,artist A where S.genre_id=G.genre_id and A.artist_id=S.artist_id;', (err,rows)=>{
        //return the connection to pool
       // console.log(rows)
       // console.log(JSON.parse(JSON.stringify(rows)));
       let row=JSON.parse(JSON.stringify(rows));
       res.render(path+'/admin.hbs',{info:row});
   })
}