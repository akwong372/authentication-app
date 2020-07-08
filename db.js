require('dotenv').config();
const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption');
// const secret = process.env.SECRET;

mongoose.connect('mongodb://localhost:27017/userDB', { useUnifiedTopology: true, useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// userSchema.plugin(encrypt, { secret, encryptedFields: ['password'] });

const UserModel = mongoose.model('User', userSchema);

module.exports.UserModel = UserModel;