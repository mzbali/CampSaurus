const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const user = new User({ username, email }); //password provide later
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, function (err) { //session username or userId pushed, so logged in
            if (err) return next(err);
            req.flash('success', 'Welcome, New User. :)');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), catchAsync(async (req, res) => {
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    req.flash('success', 'Welcome!! :)');
    res.redirect(redirectUrl);
}));

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'logged you out');
    res.redirect('/login');
});

module.exports = router;