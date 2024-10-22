const express = require("express");
const router = express.Router();
const Listing = require("../models/listings.js");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema} = require("../schema.js");
const {isLoggedIn} = require("./middleware.js");

/* validate middleware */
const validateListing = (req,res,next) => {
    const {error} = listingSchema.validate(req.body);
    if(error)
    {
        let errorMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errorMsg);
    }
    else
    {
        next();
    }
}

//index route

router.get("/",wrapAsync(async (req,res) => {
    const allListings = await Listing.find();
    // console.log(allListings);
    res.render("index.ejs",{allListings});
}))

// new route

router.get("/new", isLoggedIn, (req,res) => {
    console.log(req.user);
    res.render("new.ejs");
})

//show route
router.get("/:id",wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
    //console.log(listing);
    if(!listing)
    {
        req.flash("error","Listing you requested for doesnot exists!");
        res.redirect("/listings"); 
    }
    //console.log(listing);
    res.render("show.ejs",{listing});
}))

//create route

router.post("/",
    validateListing,
    wrapAsync( async(req,res,next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success","New listing created!");
    res.redirect("/listings")        
}
));

//edit route

router.get("/:id/edit",isLoggedIn,wrapAsync(async (req,res) => {
let {id} = req.params;
let listing = await Listing.findById(id);
console.log(listing);
    if(!listing)
    {
        req.flash("error","Listing you requested for doesnot exists!");
        res.redirect("/listings"); 
    }
res.render("edit.ejs",{listing});
}))

router.put("/:id",
      validateListing,
      wrapAsync(async (req,res,next) => {
      if(!req.body.listing)
      {
        throw new ExpressError(400,"send valid data for listing");
      }
      let {id} = req.params;
     await Listing.findByIdAndUpdate(id,{...req.body.listing});
     req.flash("success","listing updated successfully!");
      res.redirect(`/listings/${id}`);
}))

// delete route

router.delete("/:id",isLoggedIn,wrapAsync(async (req,res) => {
let {id} = req.params;
await Listing.findByIdAndDelete(id);
req.flash("success","listing deleted successfully!");
res.redirect("/listings");
}));

module.exports = router;
