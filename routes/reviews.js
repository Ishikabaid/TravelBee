const express = require('express');
const router = express.Router({mergeParams: true});
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');

const catchAsyncWrapper = require('../utilities/catchAsyncWrapper');
const ExpressError = require('../utilities/expressError');

const Campground = require('../models/campground');
const Review = require('../models/review');

router.post('/', isLoggedIn, validateReview, catchAsyncWrapper(reviews.createReview));
 
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsyncWrapper(reviews.deleteReview));
 
module.exports = router;
