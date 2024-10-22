const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {saveRedirectUrl} = require("./middleware");

router.get("/signup",async (req,res) => {
    res.render("users/signup.ejs");
})

router.post("/signup",wrapAsync(async(req,res,next) => {

    try
    {
    let {username,email,password} = req.body;
    const newUser = new User({email,username});
    const registeredUser = await User.register(newUser,password);
    req.login(registeredUser , (err) => {
        if(err)
        {
            next(err);
        }
        req.flash("success","welcome to wanderlust");
        res.redirect("/listings");
    })
    console.log(registeredUser);
    }
    catch(e){
        console.log(e);
        req.flash("error",e.message);
        res.redirect("/signup");  
    }
}));

router.get("/login",async (req,res) => {
    res.render("users/login.ejs");
})

router.post("/login",
             saveRedirectUrl,
             passport.authenticate('local', 
                { failureRedirect: '/login',
                    failureFlash:true }),
             async(req,res) => {
                req.flash("success","welcome to wanderlust!");
                let redirectUrl = res.locals.redirectUrl || "/listings";
                res.redirect(redirectUrl);
             }
            );

router.get("/logout",async (req,res,next) => {
    req.logout((err) => {
        if(err){
            return next(err);
        }
    req.flash("success","you logged out successfully!");
    res.redirect("/listings");
    });
})
module.exports = router;
