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
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vitae harum dolore non ad debitis. Similique provident voluptatem omnis aut in totam nam labore praesentium minus sint autem ullam, unde vitae.Sapiente amet nostrum alias consequatur, maxime excepturi eos doloribus error culpa est? Facere esse provident non illum sequi sapiente consequatur, aperiam quisquam est minima iure pariatur molestias, odit impedit ratione.',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            price: parseFloat(`${Math.floor(Math.random() * 20) + 10}.${Math.floor(Math.random() * 100)}`),
            author: '607a36d05eb6e020e0b70217',
            images: [
                {
                    url: 'https://res.cloudinary.com/zoke/image/upload/v1618898946/CampSaurus/semlpguqoccqde43wobi.jpg',
                    filename: 'CampSaurus/semlpguqoccqde43wobi'
                },
                {
                    url: 'https://res.cloudinary.com/zoke/image/upload/v1618892971/CampSaurus/qqtmycezbivypwzzyywn.jpg',
                    filename: 'CampSaurus/qqtmycezbivypwzzyywn'
                },
                {
                    url: 'https://res.cloudinary.com/zoke/image/upload/v1618892972/CampSaurus/d2e8sha7mkgiyidfmin7.jpg',
                    filename: 'CampSaurus/d2e8sha7mkgiyidfmin7'
                }
            ]
        })
        await campground.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close();
    console.log('db connection closed');
})