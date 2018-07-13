var express = require("express"),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    User = require("./user"),
    flash = require("connect-flash");
    
mongoose.connect("mongodb://localhost/splitwise_database");

var app = express();    

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
   secret: "Split it wisely",
   resave: false,
   saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.get("/", function(req, res){
   res.render("home");
});

app.get("/useracc", isLoggedIn, function(req, res){
   res.render("user_acc");
});

//Registration

app.get("/register", function(req, res){
   res.render("register"); 
});

app.post("/register", function(req, res){
   User.register(new User({username: req.body.username}), req.body.password, function(err, user){
      if(err){
         return res.render("register",{"error": err.message});
      }else{
         passport.authenticate("local")(req, res, function(){
            req.flash("success", "Registered Successfully!");
            res.redirect("/login");
         });
      }
   });
});

//Login

app.get("/login", function(req, res){
   res.render("login"); 
});

app.post("/login", function(req, res, next){
   passport.authenticate("local", 
   {
   successRedirect: "/useracc",
   failureRedirect: "/login",
   failureFlash: true,
   successFlash: "You Logged In Successfully!"
   })(req, res);
});

//Logout

app.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "You Logged Out Successfully!");
   res.redirect("/");
});

function isLoggedIn(req, res, next){
   if (req.isAuthenticated()){
      return next();
   }
   req.flash("error", "You need to be logged in first");
   res.redirect("/login");
}

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Splitwise Server Has Been Started..."); 
});

