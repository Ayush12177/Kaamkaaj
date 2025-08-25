const express = require('express');
const router = express.Router();
const passport = require('passport');

// auth with google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// callback route for google to redirect to
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    // handle successful authentication
    res.redirect('/dashboard'); // Redirect to user dashboard or appropriate page
});

module.exports = router;
