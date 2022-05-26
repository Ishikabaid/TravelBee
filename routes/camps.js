const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsyncWrapper = require('../utilities/catchAsyncWrapper');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer  = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


router.route('/')
    .get(catchAsyncWrapper(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsyncWrapper(campgrounds.createCampground));
    // .post(upload.array('image'), (req,res) => {
    //     console.log(req.body, req.files);
    //     res.send("IT WORKED!!");
    // });

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsyncWrapper(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsyncWrapper(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsyncWrapper(campgrounds.deleteCampground));
    
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsyncWrapper(campgrounds.renderEditForm));

module.exports = router;