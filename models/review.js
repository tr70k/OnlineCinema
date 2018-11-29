const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let reviewScheme = new Schema({
    username: {
        type: String,
        lowercase: true,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        lowercase: true,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    }
});

reviewScheme.statics.get = function({username, url, skip, limit}) {
    let Review = this;
    let params = {};
    if (username) params.username = username;
    if (url) params.url = url;
    let options = {};
    if (skip) options.skip = skip;
    if (limit) options.limit = limit;
    return Review.find(params, {_id: false}, options);
};

exports.Review = mongoose.model('Review', reviewScheme);