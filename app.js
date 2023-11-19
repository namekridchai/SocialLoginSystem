const express = require("express");
const mongoose = require('mongoose');
const passport =  require("passport")
const User  = require('./user.js')
const session = require('express-session')
mongoose.connect('mongodb://127.0.0.1:27017/User', {useNewUrlParser: true, useUnifiedTopology: true});
const app = express();
app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
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


app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
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
    res.send('log in success')
  }) 
  app.post('/login',(req,res)=>{
    passport.authenticate('local',{failureFlash:true,failureRedirect:'/login',keepSessionInfo: true})
    res.redirect('/')
  })

  app.get('/login',(req,res)=>{
    res.send('please log in')
  })

  app.get('/register',(req,res)=>{
    res.send('please register')
  })
app.listen(port, () => {
  console.log(`Server running at <http://localhost>:${port}/`);
});



 

