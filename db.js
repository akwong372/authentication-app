const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');

// const encrypt = require('mongoose-encryption');
// const secret = process.env.SECRET;

mongoose.connect('mongodb://localhost:27017/userDB', { useUnifiedTopology: true, useNewUrlParser: true });

const userSchema = new Schema({
    username: String,
    password: String,
    googleId: String,
    facebookId: String
});

// userSchema.plugin(encrypt, { secret, encryptedFields: ['password'] });

userSchema.plugin(passportLocalMongoose, {usernameUnique: false});
userSchema.plugin(findOrCreate);

const UserModel = mongoose.model('User', userSchema);

module.exports.UserModel = UserModel;