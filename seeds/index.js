const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptor, places } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/campsaurus', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'database connection error'));
db.once('open', () => {
    console.log('Connection established with database');
})

const randEl = arr => arr[Math.floor(Math.random() * arr.length)];

const seedDb = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const campground = new Campground({
            title: `${randEl(descriptor)} ${randEl(places)}`,
            price: `$${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 100)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`
        })
        await campground.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close();
    console.log('db connection closed');
})