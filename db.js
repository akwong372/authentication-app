const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/userDB', {useUnifiedTopology: true, useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const UserModel = mongoose.model('User', userSchema);

module.exports.UserModel = UserModel;