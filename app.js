if(process.env.NODE_ENV !== "production")
    require('dotenv').config()
const express = require("express");
const mongoose = require('mongoose');
const passport =  require("passport")
const User  = require('./user.js')
const session = require('express-session')
const local = require('passport-local')
const path = require('path');
mongoose.connect('mongodb://127.0.0.1:27017/User', {useNewUrlParser: true, useUnifiedTopology: true});
const app = express();
app.use(express.urlencoded({extended:true}));
app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
    res.locals.user = req.user
    next();
  });

app.use(express.json());
app.use(passport.initialize());


const port = 3000;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const configSession = {
 
    secret:'this is secret'
    ,resave:false,
    saveUninitialized:true,
    cookie:{
      httpOnly:true,
      expires:Date.now()+1000*60*60*24*7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      message:"time out",
      
    }
  }
app.use(session(configSession))
app.use(passport.session())
passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
passport.deserializeUser(function(user, done) {
    done(null, user);
  });
passport.use(new GoogleStrategy({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile)
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    }); 
  }
));


passport.use(new local(User.authenticate()))
// passport.serializeUser(User.serializeUser())
// passport.deserializeUser(User.deserializeUser())
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    console.log(req.user)
    // Successful authentication, redirect home.
    res.redirect('/');
  });

  app.post('/register',async(req,res)=>{
    console.log(req.body)
    try{
        console.log(req.body)
        const{username,password} = req.body;
        const user = new User({username});
        const register =await User.register(user,password);
        req.login(register,(err)=>{
            if(!err){
                res.redirect('/')
            }
            else
                next(err)  
        }) 
    }
    catch(e){
        console.log(e)
        res.redirect('/register')
    }  
  })
  app.get('/',(req,res)=>{
    console.log(req.user)
    res.send('hello' + req.user.username)
  }) 
  app.post('/login',
  ((req,res,next)=>{
   
    console.log(req.body)
    next()  
  }),
  passport.authenticate('local',{failureRedirect:'/login',keepSessionInfo: true}),
  (req,res)=>{
    
    res.redirect('/')
  })

  app.get('/login',(req,res)=>{
    res.render('login')
  })

  app.get('/register',(req,res)=>{
    res.render('register')
  })
app.listen(port, () => {
  console.log(`Server running at <http://localhost>:${port}/`);
});



 

