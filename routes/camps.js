const express = require('express');
const router = express.Router();
const catchAsyncWrapper = require('../utilities/catchAsyncWrapper');
const ExpressError = require('../utilities/expressError');
const Campground = require('../models/campground');
const {CampgroundSchema} = require('../schemas.js');

const validateCampground = (req, res, next) => {
    const {error} = CampgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}

router.get('/', catchAsyncWrapper(async(req,res) => {
    const camps = await Campground.find({});
    res.render('campsites/index', {camps});
}));

router.get('/new', (req,res) => {
    res.render('campsites/newcamp');
});

router.get('/:id', catchAsyncWrapper(async(req,res) => {
    const {id} = req.params;
    const camp = await Campground.findById(id).populate('reviews');
    // console.log(camp);
    if(!camp){
        req.flash('error', 'Destination doesn not exist');
        return res.redirect('/camps');
    }
    res.render('campsites/show', {camp});
}));

router.post('/', validateCampground, catchAsyncWrapper(async(req,res,next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid camp data', 400);
    const newcamp = new Campground(req.body.campground);
    await newcamp.save();
    req.flash('success', 'Successfully added a new destination!');
    res.redirect(`/camps/${newcamp._id}`);
}));

router.get('/:id/edit', catchAsyncWrapper(async(req,res) => {
    const foundcamp = await Campground.findById(req.params.id);
    if(!foundcamp){
        req.flash('error', 'Destination does not exist!');
        return res.redirect('/camps');
    }
    res.render('campsites/edit', {foundcamp});
}));

router.put('/:id', validateCampground, catchAsyncWrapper(async(req,res) => {
    const {id} = req.params;
    const updatedcamp = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', 'Successfully updated the destination!');
    res.redirect(`/camps/${updatedcamp._id}`);
}));

router.delete('/:id' , catchAsyncWrapper(async(req,res,next) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the destination!');
    res.redirect('/camps');
}));

module.exports = router;