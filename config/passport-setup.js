const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const seekerModel = require('../models/seeker');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    seekerModel.findById(id).then((user) => {
        done(null, user);
    });
});

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // check if user already exists in our db
            const currentUser = await seekerModel.findOne({ googleId: profile.id });

            if (currentUser) {
                // already have the user
                console.log('user is: ', currentUser);
                return done(null, currentUser);
            }

            // if not, create user in our db
            const newUser = await new seekerModel({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                image: profile.photos[0].value
            }).save();

            console.log('new user created: ' + newUser);
            done(null, newUser);
        } catch (error) {
            console.error('Error in Google Strategy:', error);
            done(error, null);
        }
    })
);