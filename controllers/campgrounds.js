const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');  //order 2
};

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author'); //order 1
    if (!campground) {
        req.flash('error', 'Campground not found.');
        res.redirect('/campgrounds');
    } else
        res.render('campgrounds/show', { campground });
};

module.exports.createCampground = async (req, res) => {
    //console.log(req.body.campground);
    const campground = new Campground({ ...req.body.campground });
    campground.author = req.user;
    //if (!req.body.campground) throw new ExpressError('campground is empty', 400); // we cand also like if req.body.campground.title empty do this etc etc, but its gonna be so muc work so we use joi.
    if (req.files) {
        campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        console.log(campground.images);
    }
    await campground.save();
    req.flash('success', 'Successfully created new campground.');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found.');
        res.redirect('/campgrounds');
    } else
        res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    console.log(imgs);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground, $push: { images: { $each: imgs } } });
    //ampground.images.push(...imgs);
    //await campground.save();
    console.log(req.body);
    if (req.body.deleteImages) {
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        for (let image of req.body.deleteImages) {
            await cloudinary.uploader.destroy(image);
        }
    }
    req.flash('success', 'Successfully updated the campground.');
    res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Deleted the campground.');
    res.redirect('/campgrounds');
};