let User = require('models/user').User;
let Movie = require('models/movie').Movie;
let Review = require('models/review').Review;

exports.get = function (req, res, next) {
    User.findOne({username: req.params.username.toLowerCase()}, {_id: false, email: false})
        .then(function (user) {
            if (!user) throw new Error("Пользователь не найден!");
            // if (user.likedMovies && user.likedMovies.length)
                return Promise.all([
                    Movie.find({url: {$in: user.likedMovies}}).catch(() => []),
                    Review.find({username: req.params.username.toLowerCase()}, {_id: false}, {sort: {_id: -1}}).catch(() => []),
                ])
                .then((data) => {
                    res.render("user.hbs", {user_profile: user, movies: data[0], reviews: data[1]});
                });
            // else return res.render("user.hbs", {user_profile: user, movies: []});
        })
        .catch((err) => next(err));
};

exports.likemovie = function(req, res, next) {
    User.liketrigger(res.locals.user, req.body.movie_url)
        .then((liked) => res.json({liked}))
        .catch((err) => res.status(403).json({message: err.message}));
};

exports.savereview = function(req, res, next) {
    User.findOne({username: res.locals.user})
        .then(function (user) {
            if (!user) throw new Error("Пользователь не найден!");
            if (user.blocked) throw new Error("Пользователь заблокирован!");

            let data = {};
            data.username = res.locals.user;
            data.title = req.body.title;
            data.url = req.body.url;
            data.text = req.body.text;
            let options = {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            };
            data.date = new Date().toLocaleString("en-US", options);
            return Review.deleteOne({url: data.url, username: data.username})
                .then(() => Review.create(data))
                .then(() => res.json(data))
        })
        .catch((err) => res.status(403).json({message: err.message}));
};

exports.removereview = function(req, res, next) {
    const url = req.body.url;
    const username = res.locals.user;

    Review.deleteOne({url, username})
        .then(() => res.json({}))
        .catch((err) => res.status(403).json({message: err.message}));
};