const express = require('express');
const router = express.Router({ mergeParams: true }); // app :id same as here id
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review');
const { isLoggedIn, isReviewAuthor, validateReview } = require('../middleware');

router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const review = new Review(req.body.review);
    review.author = req.user;
    const campground = await Campground.findById(id);
    campground.reviews.push(review);
    await Promise.all([review.save(), campground.save()]);
    req.flash('success', 'Successfully created your review');
    res.redirect(`/campgrounds/${id}`);
}));


router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //pull anything out that has the review id
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Deleted the review.');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;
