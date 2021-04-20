if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/users');

mongoose.connect('mongodb://localhost:27017/campsaurus', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });

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

app.use(passport.initialize());
app.use(passport.session()); //for persitence log in session
passport.use(new LocalStrategy(User.authenticate())); //take username and password from form and store the user

passport.serializeUser(User.serializeUser()); //from user, userId store it in session
passport.deserializeUser(User.deserializeUser()); //from userId take all info and populate req.user

app.use((req, res, next) => {
    //res.locals.success = req.flash('success');
    //res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    res.locals.messages = { success: req.flash('success'), danger: req.flash('error') };
    next();
})

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes); //router for review resource where the crud lies
app.use('/', userRoutes);

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