const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const session = require('express-session');
const flash = require('connect-flash');

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
app.use(express.static(path.join(__dirname, 'public')));
const sessionOption = {
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() * 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
    //store: "mongoDB or Redis"
}
app.use(session(sessionOption));
app.use(flash()); // added req.flash() method to req.
app.use((req, res, next) => {
    //res.locals.success = req.flash('success');
    //res.locals.error = req.flash('error');
    res.locals.messages = { success: req.flash('success'), danger: req.flash('error') };
    next();
})

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews); //router for review resource where the crud lies

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