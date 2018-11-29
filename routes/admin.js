let User = require('models/user').User;
let Genre = require('models/genre').Genre;
let Movie = require('models/movie').Movie;
let Review = require('models/review').Review;
const getmoviedata = require('libs/getmoviedata');

exports.add = function(req, res, next) {
    res.render("addmovie.hbs", {});
};

exports.edit = function(req, res, next) {
    res.render("editmovie.hbs", {});
};

exports.block = function(req, res, next) {
    res.render("blockuser.hbs", {});
};

exports.getdata = function(req, res, next) {
    getmoviedata.get(req.body)
        .then((info) => {
            return (Genre.getTitlesByOrigTitles(info.imdb_data.Genre.split(', ')))
                .then((genres => {
                    let data = {};

                    data.title = info.kinopoisk_data.title;
                    data.imdb_id = info.imdb_data.imdbID;
                    data.kinopoisk_id = info.kinopoisk_data.kinopoisk_id;
                    data.title_orig = info.imdb_data.Title;
                    data.year = info.imdb_data.Year.slice(0, 4);
                    data.url = info.imdb_data.Title.toLowerCase().replace(/ /g, "-") + "-" + data.year;
                    data.genres = genres;
                    data.is_multiseries = info.kinopoisk_data.is_multiseries;
                    data.poster = info.imdb_data.Poster;
                    data.description = info.kinopoisk_data.description;
                    data.message = "Информация получена!";

                    return res.json({data});
                }));
        })
        .catch((err) => res.status(403).json({message: err.message}));
};

exports.addmovie = function(req, res, next) {
    if (!req.body.url.match(/^[a-zA-Z\d][\w\-]{2,}[a-zA-Z\d]$/)) {
        return res.status(403).json({message: "URL фильма/сериала может состоять только из 4х и более букв, цифр и символов '_'"});
    }

    Movie.createnew(req.body)
        .then((movie) => res.json({message: `Добавлен фильм: <a href="movies/${movie.url}" target="_blank">"${movie.title}"</a>`}))
        .catch((err) => res.status(403).json({message: err.message}));
};

exports.editmovie = function(req, res, next) {
    Movie.findOne({url: req.body.url}, {_id: false})
        .then((movie) => {
            if (!movie) throw new Error("Фильм не найден!");
            return Promise.all([
                Promise.resolve(movie),
                Genre.getTitlesByNumbers(movie.genres)
                    .then((genres) => genres.map((item) => item.title))
            ]);
        })
        .then((movie) => res.json(movie))
        .catch((err) => res.status(403).json({message: err.message}));
};

exports.updatemovie = function(req, res, next) {
    res.locals.title = req.body.title;
    delete req.body.title;
    Movie.upd(req.body)
        .then(() => res.json({message: `Информация о фильме/сериале <a href="movies/${req.body.url}" target="_blank">"${res.locals.title}"</a> обновлена.`}))
        .catch((err) => res.status(403).json({message: err.message}));
};

exports.deletemovie = function(req, res, next) {
    Movie.del(req.body.url)
        .then(() => res.json({message: `Фильм/сриал (${req.body.url}) удалён.`}))
        .catch((err) => res.status(403).json({message: err.message}));
};

exports.blockuser = function(req, res, next) {
    User.findOne({username: req.body.username})
        .then((user) => {
            if (!user) throw new Error("Пользователь не найден.");
            return User.findOneAndUpdate({username: req.body.username}, {blocked: true});
        })
        .then(() => res.json({username: req.body.username}))
        .catch((err) => res.status(403).json({message: err.message}));
};

exports.unblockuser = function(req, res, next) {
    User.findOne({username: req.body.username})
        .then((user) => {
            if (!user) throw new Error("Пользователь не найден.");
            return User.findOneAndUpdate({username: req.body.username}, {blocked: false});
        })
        .then(() => res.json({username: req.body.username}))
        .catch((err) => res.status(403).json({message: err.message}));
};

exports.getuserreviews = function(req, res, next) {
    Review.find({username: req.body.username}, {_id: false}, {sort: {_id: -1}})
        .then((reviews) => res.json({reviews}))
        .catch((err) => res.status(403).json({message: err.message}));
};

exports.removeuserreviews = function(req, res, next) {
    Review.deleteMany({username: req.body.username})
        .then(() => res.json({username: req.body.username}))
        .catch((err) => res.status(403).json({message: err.message}));
};

exports.removeuserreview = function(req, res, next) {
    Review.deleteOne({username: req.body.username, url: req.body.url})
        .then(() => res.json({}))
        .catch((err) => res.status(403).json({message: err.message}));
};