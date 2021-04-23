const mongoose = require('mongoose');
const { Schema } = mongoose;
const Review = require('./review');

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const geoJsonSchema = new Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
});

const CampgroundSchema = new Schema({
    title: String,
    description: String,
    location: String,
    price: Number,
    //image: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    images: [ImageSchema],
    geometry: geoJsonSchema
});

CampgroundSchema.post('findOneAndDelete', async (campground) => {
    await Review.deleteMany({
        _id: {
            $in: campground.reviews
        }
    });
})

module.exports = mongoose.model('Campground', CampgroundSchema);
