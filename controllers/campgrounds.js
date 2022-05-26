const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async(req,res) => {
    const camps = await Campground.find({});
    res.render('campsites/index', {camps});
};

module.exports.renderNewForm = (req,res) => {
    res.render('campsites/newcamp');
};

module.exports.createCampground = async(req,res,next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid camp data', 400);
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const newcamp = new Campground(req.body.campground);
    newcamp.geometry = geoData.body.features[0].geometry;
    newcamp.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    newcamp.author = req.user._id;
    await newcamp.save();
    console.log(newcamp);
    req.flash('success', 'Successfully added a new destination!');
    res.redirect(`/camps/${newcamp._id}`);
};

module.exports.showCampground = async(req,res) => {
    const {id} = req.params;
    const camp = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    // console.log(camp);
    if(!camp){
        req.flash('error', 'Destination doesn not exist');
        return res.redirect('/camps');
    }
    res.render('campsites/show', {camp});
};

module.exports.renderEditForm = async(req,res) => {
    const { id } = req.params;
    const foundcamp = await Campground.findById(id);
    if(!foundcamp){
        req.flash('error', 'Destination does not exist!');
        return res.redirect('/camps');
    }
    res.render('campsites/edit', {foundcamp});
};

module.exports.updateCampground = async(req,res) => {
    const { id } = req.params;
    const updatedcamp = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    updatedcamp.images.push(...imgs);
    await updatedcamp.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await updatedcamp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages }}}});
    }
    req.flash('success', 'Successfully updated the destination!');
    res.redirect(`/camps/${updatedcamp._id}`);
};

module.exports.deleteCampground = async(req,res,next) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the destination!');
    res.redirect('/camps');
};