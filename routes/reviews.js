const express = require('express');
const router = express.Router({ mergeParams: true }); // app :id same as here id
const Campground = require('../models/campground');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review');
const { reviewSchema } = require('../schemas');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(e => e.message).join(',');
        throw new ExpressError(msg, 404);
    } else {
        next();
    }
}

router.post('/', validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const review = new Review(req.body.review);
    const campground = await Campground.findById(id);
    campground.reviews.push(review);
    await Promise.all([review.save(), campground.save()]);
    req.flash('success', 'Successfully created your review');
    res.redirect(`/campgrounds/${id}`);
}));


router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //pull anything out that has the review id
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Deleted the review.');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;
