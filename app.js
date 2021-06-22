const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require('bcrypt');
const mongoDbSession = require("connect-mongodb-session")(session);

const UserModel = require("./Models/User");



mongoose.connect('mongodb://localhost:27017/sessions', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});




const app = express();

const store = new mongoDbSession({
    uri:'mongodb://localhost:27017/sessions',
    collection:'mysession'
});

app.use(session({
    secret:"key that will assign cookie",
    resave:false,
    saveUninitialized:false,
    store:store
}));


const isAuth = (req,res,next) =>{
    if(req.session.isAuth){
        next();
        
    }
    else{
        res.redirect("/login");
    }
}


app.use(bodyParser.urlencoded({extended:false}));
app.set("view engine","ejs");
 


app.get("/",(req,res)=>{
    //console.log(req.session);
    req.session.isAuth = true;
    //console.log(req.session);
    console.log(req.session.id);
    res.send("Hello");
});





app.get("/login",(req,res)=>{
    res.render("index");
});

app.post("/login",async (req,res)=>{
    const email =  req.body.email;
    const password = req.body.password;
    
    let user =await UserModel.findOne({email});

    if(!user){
        res.redirect("/login");
    }
    
    const isMatch  = await bcrypt.compare(password,user.password);

    if(!isMatch){
        res.redirect("/login");
    }

    req.session.isAuth = true;

    res.redirect("/secrets");

});



app.get("/register",(req,res)=>{
    res.render("register");
})

app.post("/register",async(req,res)=>{
    const username = req.body.username;
    const email =  req.body.email;
    const password = req.body.password;
    let user = UserModel.findOne({email});
    const hashedPWD = await bcrypt.hash(password,12);

    if(user){
        res.redirect("/login");
    }
    
    const newUser = new UserModel({
        username,
        email,
        password:hashedPWD

    });
    await newUser.save();
    res.redirect("/login");
    }   
);


app.get("/secrets", isAuth ,(req,res)=>{
    res.render("secrets");
});

app.post("/logout",(req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/login");
        }
    });
});

app.listen(3000,()=>{
    console.log("Server Running at port 3000");
})