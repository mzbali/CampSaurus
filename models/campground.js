const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
    title: String,
    description: String,
    location: String,
    price: Number,
    image: String
})

module.exports = mongoose.model('Campground', campgroundSchema);
