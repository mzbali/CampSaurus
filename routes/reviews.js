const express = require('express');
const router = express.Router({ mergeParams: true }); // app :id same as here id
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isReviewAuthor, validateReview } = require('../middleware');
const reviews = require('../controllers/reviews');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
