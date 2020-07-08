//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const db = require('./db.js');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    db.UserModel.findOne({email}, (err, user)=>{
        if (err){
            console.log(`Error logging in: ${err}`);
            res.redirect('/login');
        } else if (user){
            if (user.password === password){
                console.log(`Logged in: ${email}`);
                res.render('secrets');
            } else {
                console.log(`Wrong password: ${email}`);
                res.redirect('/login');
            }
        } else {
            console.log(`No user found: ${email}`);
            res.redirect('/login');
        }
    });
});

app.get('/register', (req, res) => {
    res.render('register')
});

app.post('/register', (req, res)=>{
    const user = new db.UserModel({
        email: req.body.username,
        password: req.body.password
    });

    user.save(err=>{
        if (err){
            console.log(`Error saving new user: ${err}`);
            res.redirect('/register');
        } else {
            console.log('New user saved');
            res.render('secrets');
        }
    });
})

app.listen(port, () => console.log(`Listening on port ${port}`));