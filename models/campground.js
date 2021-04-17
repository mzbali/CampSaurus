const mongoose = require('mongoose');
const { Schema } = mongoose;
const Review = require('./review');

const CampgroundSchema = new Schema({
    title: String,
    description: String,
    location: String,
    price: Number,
    image: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

CampgroundSchema.post('findOneAndDelete', async (campground) => {
    await Review.deleteMany({
        _id: {
            $in: campground.reviews
        }
    });
})

module.exports = mongoose.model('Campground', CampgroundSchema);
