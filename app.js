const express = require("express");
const app = express();
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require("path");
const ExpressError = require("./utils/ExpressError.js");


const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");



/* express session */
const session = require("express-session");
const flash = require("connect-flash");
const listingRouter = require("./router/listing.js");
const reviewRouter = require("./router/review.js");
const usersRouter = require("./router/user.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname , "views"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));

/* session options */
const sessionOptions = {
    secret : "mysupersecretcode",
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

main().then(() => console.log("connected to database successfully!")).
       catch(err => console.log(err));

async function main() 
{
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust2');
}
app.listen(8080,() => {
    console.log("server is running at port number 8080");
})

app.get("/",(req,res) => {
    res.send("Server is working well!");
})

app.use((req,res,next) => { 
    res.locals.success = req.flash("success"); //it is array by default
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.get("/demoUser",async (req,res) => {
    let fakeUser = new User({
        email:"student@gmail.com",
        username:'delta-student',
    })
    let registeredUser = await User.register(fakeUser,'helloworld');
    res.send(registeredUser);
})

app.use("/listings",listingRouter);

/* for reviews */
app.use("/listings/:id/reviews",reviewRouter);

/* for signup */
app.use("/",usersRouter);

app.all("*",(req,res,next) => {
    next(new ExpressError(404,"Page Not Found!"));
});

/* Error */
app.use((err,req,res,next) => {
    let {statusCode = 500,message = "something went wrong!"} = err;
    res.status(statusCode).render("Error.ejs",{message});
    //res.status(statusCode).send(message);
});