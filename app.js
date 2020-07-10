//jshint esversion:6
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db.js');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'verysecretstring',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//////////   login strategies
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/secrets',
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
    passReqToCallback: true
},
    (req, accessToken, refreshToken, profile, cb) => {
        db.UserModel.findOrCreate({ googleId: profile.id, username: 'test' }, function (err, user) {
            return cb(err, user);
        });
    }
));

/////////   FACEBOOK login strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FB_ID,
    clientSecret: process.env.FB_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/secrets",
    passReqToCallback: true
},
    (req, accessToken, refreshToken, profile, cb) => {
        db.UserModel.findOrCreate({ facebookId: profile.id, username: 'test' }, function (err, user) {
            return cb(err, user);
        });
    }
));

mongoose.connect('mongodb://localhost:27017/userDB', { useUnifiedTopology: true, useNewUrlParser: true });
mongoose.set('useCreateIndex', true);

passport.use(db.UserModel.createStrategy());

passport.serializeUser((user, done) => {
    done(null, user._id);
});
passport.deserializeUser((id, done) => {
    db.UserModel.findById(id, (err, user) => {
        done(err, user);
    })
});

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/secrets', (req, res) => {
    if (req.isAuthenticated()) {
        return res.render('secrets');
    }
    return res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {

    const user = new db.UserModel({
        username: req.body.username,
        password: req.body.passport
    });

    req.login(user, (err) => {
        if (err) {
            console.log(`Error logging in: ${err}`);
            return res.redirect('/login');
        }
        return res.redirect('/secrets');

    });
});

app.get('/logout', (req, res) => {
    console.log('Logging out');
    req.logout();
    res.redirect('/login');
})

app.get('/register', (req, res) => {
    res.render('register')
});

app.post('/register', (req, res) => {

    console.log('Registering account');

    db.UserModel.register({ username: req.body.username }, req.body.password, (err, user) => {
        if (err) {
            console.log(`Error registering user: ${err}`);
            res.redirect('/register');
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets');
            });
        }
    })
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/secrets');
    });

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.listen(port, () => console.log(`Listening on port ${port}`));
