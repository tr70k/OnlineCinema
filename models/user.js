const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userScheme = new Schema({
    username: {
        type: String,
        lowercase: true,
        unique: true,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        required: true
    },
    telegram: {
        type: String
    },
    twitter: {
        type: String
    },
    vk: {
        type: String
    },
    instagram: {
        type: String
    },
    hashedPassword: {
        type: String,
        required: true
    },
    likedMovies: {
        type: [String]
    },
    blocked: {
        type: Boolean,
        default: false
    }
}/*, {autoIndex: false}*/);

userScheme.virtual('password')
    .set(function(password) {
        let saltRounds = 10;
        this.hashedPassword = bcrypt.hashSync(password, saltRounds);
    });

userScheme.methods.checkPassword = function(password) {
    return bcrypt.compare(password, this.hashedPassword);
};

userScheme.statics.authorize = function(username, password) {
    let User = this;
    return User.findOne({username})
        .then(function (user) {
            if (!user) throw new Error("user not found");
            return user.checkPassword(password);
        })
        .then(function (isCorrect) {
            if (isCorrect) return username;
            throw new Error("incorrect password");
        });
};

userScheme.statics.createnew = function(username, password, email) {
    let User = this;
    return User.findOne({username})
        .then(function (user) {
            if (user) throw new Error("that username is taken");
            return User.create({username, password, email});
        })
        .then(() => username);
};

userScheme.statics.liketrigger = function(username, movieurl) {
    let User = this;
    let liked = false;
    return User.findOne({username})
        .then(function (user) {
            if (!user) throw new Error("user not found");
            let index = user.likedMovies.indexOf(movieurl);
            if (~index) user.likedMovies.splice(index, 1);
            else {
                user.likedMovies.push(movieurl);
                liked = true;
            }
            return user.save();
        })
        .then(() => liked);
};

exports.User = mongoose.model('User', userScheme);