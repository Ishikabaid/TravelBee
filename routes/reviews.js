const express = require('express');
const router = express.Router({mergeParams: true});

const catchAsyncWrapper = require('../utilities/catchAsyncWrapper');
const ExpressError = require('../utilities/expressError');

const Campground = require('../models/campground');
const Review = require('../models/review');
const {reviewSchema} = require('../schemas.js');

//middleware
const validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else{
        next();
    }
}

router.post('/', validateReview, catchAsyncWrapper(async(req,res) => {
    const {id} = req.params;
    const camp = await Campground.findById(id);
    const review = new Review(req.body.review);
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    req.flash('success', 'Added your review!');
    res.redirect(`/camps/${camp._id}`);
 }))
 
router.delete('/:reviewId', catchAsyncWrapper(async(req,res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
 //    res.send("Deleteee!!")
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/camps/${id}`);
 }))
 
module.exports = router;
