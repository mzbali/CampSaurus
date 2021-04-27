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
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/campsaurus';
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });

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

const secret = process.env.SECRET || 'secret';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 3600
});

store.on('error', e => {
    console.log('Session Store Error: ', e)
});
const sessionOption = {
    store,
    name: 'foded', //change the default name of session id
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() * 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        //secure: true //cant access session without request over https
    }
    //store: "mongoDB or Redis"
}
app.use(session(sessionOption));
app.use(flash()); // added req.flash() method to req.
app.use(mongoSanitize());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/zoke/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session()); //for persitence log in session
passport.use(new LocalStrategy(User.authenticate())); //take username and password from form and store the user

passport.serializeUser(User.serializeUser()); //from user, userId store it in session
passport.deserializeUser(User.deserializeUser()); //from userId take all info and populate req.user

app.use((req, res, next) => {
    //res.locals.success = req.flash('success');
    //res.locals.error = req.flash('error');
    //console.log(req.query);
    if (/\/campgrounds\/[0-9a-fA-F]{24}\?\_method=\w+$/.test(req.originalUrl) || /\/campgrounds\/[0-9a-fA-F]{24}\/?$/.test(req.originalUrl) || /\/campgrounds\/?$/.test(req.originalUrl)) {
        res.locals.route = req.originalUrl;
    } else {
        res.locals.route = null;
    }
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
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Listening on port 3000');
});