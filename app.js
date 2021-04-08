const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const Campground = require('./models/campground');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const { campgroundSchema } = require('./schemas');

mongoose.connect('mongodb://localhost:27017/campsaurus', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: ')); //execute this function everytime the given event(error) is generated
db.once('open', () => {
    console.log('connection established'); //execute this function when the given event is generated once
});

const app = express();

app.engine('ejs', engine);

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        msg = error.details.map(e => e.message).join(',');
        throw new ExpressError(msg, 404);
    } else {
        next();
    }
}

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');  //order 2
});

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id); //order 1
    res.render('campgrounds/show', { campground });
}));

app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    //console.log(req.body.campground);
    const campground = new Campground({ ...req.body.campground });
    if (!req.body.campground) throw new ExpressError('campground is empty', 400); // we cand also like if req.body.campground.title empty do this etc etc, but its gonna be so muc work so we use joi.
    await campground.save();
    res.redirect('/campgrounds');
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground });
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${id}`);
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));


app.get('/', (req, res) => {
    res.render('home');
});

//path that doesn't have any meaning
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
});

//error handler middleware
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});