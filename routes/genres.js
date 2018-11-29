let Genre = require('models/genre').Genre;

exports.get = function (req, res, next) {
    Genre.find({count: {$gt: 0}}, {_id: false}, {sort: {title: 1}})
        .then((genres) => res.render("genres.hbs", {genres}))
        .catch((err) => next(err));
};