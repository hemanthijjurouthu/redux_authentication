const express = require("express");
const router = express.Router({mergeParams : true});
const {reviewSchema} = require("../schema.js");
const Listing = require("../models/listings.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/reviews.js");

/* review middleware */

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errorMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errorMsg);
    } else {
        next();
    }
};


/* Review Route */

router.post("/", validateReview, wrapAsync(async (req, res) => {
    console.log(req.body); // Check the form data being submitted
    console.log(req.params.id);

    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("New review saved successfully");
    req.flash("success","new review created!");
    res.redirect(`/listings/${listing._id}`);
}));

/*   DELETE ROUTE for reviews */
router.delete("/:reviewId",wrapAsync(async(req,res) => {
    let {id,reviewId} = req.params;

    await Listing.findByIdAndUpdate(id , {$pull : {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","review deleted succeessfully!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;