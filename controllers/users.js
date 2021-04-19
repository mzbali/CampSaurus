const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = async (req, res) => {
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
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

module.exports.login = async (req, res) => {
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    req.flash('success', 'Welcome!! :)');
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout();
    if (req.session.returnTo) delete req.session.returnTo; //if logout, then login with different user forget the path
    req.flash('success', 'logged you out');
    res.redirect('/login');
};
