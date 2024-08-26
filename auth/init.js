const passport = require('passport');
const User = require('../models/User'); //TODO: Test functionality after changing to sequlelize

module.exports = function () {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
};