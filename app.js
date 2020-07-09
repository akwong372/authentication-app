//jshint esversion:6
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db.js');
const session = require('express-session');
const passport = require('passport')

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

mongoose.connect('mongodb://localhost:27017/userDB', { useUnifiedTopology: true, useNewUrlParser: true });
mongoose.set('useCreateIndex', true);

passport.use(db.UserModel.createStrategy());

passport.serializeUser(db.UserModel.serializeUser());
passport.deserializeUser(db.UserModel.deserializeUser());

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

app.listen(port, () => console.log(`Listening on port ${port}`));