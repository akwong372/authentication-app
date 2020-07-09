const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

// const encrypt = require('mongoose-encryption');
// const secret = process.env.SECRET;

mongoose.connect('mongodb://localhost:27017/userDB', { useUnifiedTopology: true, useNewUrlParser: true });

const userSchema = new Schema({
    email: String,
    password: String
});

// userSchema.plugin(encrypt, { secret, encryptedFields: ['password'] });

userSchema.plugin(passportLocalMongoose);

const UserModel = mongoose.model('User', userSchema);

module.exports.UserModel = UserModel;