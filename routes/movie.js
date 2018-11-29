let User = require('models/user').User;
let Genre = require('models/genre').Genre;
let Movie = require('models/movie').Movie;
let Review = require('models/review').Review;
const getmoviedata = require('libs/getmoviedata');
const config = require('config');

exports.get = function(req, res, next) {
    Movie.findOne({url: req.params.movieurl.toLowerCase()}, {_id: false})
        .then(function (movie) {
            if (!movie) throw new Error("Фильм не найден!");
            return Promise.all([
                Promise.resolve(movie),
                getmoviedata.get({imdb_id: movie.imdb_id, kinopoisk_id: movie.kinopoisk_id}),
                Genre.getTitlesByNumbers(movie.genres),
                User.findOne({username: res.locals.user})
                    .then((user) => [~user.likedMovies.indexOf(req.params.movieurl), user.blocked])
                    .catch(() => false),
                Review.find({url: req.params.movieurl.toLowerCase()}, {_id: false}, {sort: {_id: -1}}),
                Review.findOne({url: req.params.movieurl.toLowerCase(), username: res.locals.user}, {_id: false, text: true})
            ]);
        })
        .then((movie) => {
            movie[0].iframe_url = movie[1].kinopoisk_data.iframe_url + "&psid=" + config.get('hdbaza:player_style');
            movie[0].imdb_rating = movie[1].imdb_data.imdbRating;
            movie[0].imdb_votes = movie[1].imdb_data.imdbVotes;
            movie[0].ratings = movie[1].imdb_data.Ratings;
            movie[0].release_date = movie[1].imdb_data.Released;
            movie[0].countries = movie[1].imdb_data.Country;
            movie[0].genre_titles = movie[2];
            movie[0].runtime = movie[1].imdb_data.Runtime;
            movie[0].director = movie[1].imdb_data.Director;
            movie[0].writer = movie[1].imdb_data.Writer;
            movie[0].actors = movie[1].imdb_data.Actors;
            movie[0].awards = movie[1].imdb_data.Awards;
            movie[0].description_en = movie[1].imdb_data.Plot;
            movie[0].is_liked = movie[3][0];
            movie[0].is_blocked = movie[3][1];
            movie[0].text = (movie[5] && movie[5].text) ? movie[5].text : "";
            movie[0].reviews = movie[4];
            res.render("movie.hbs", movie[0]);
        })
        .catch((err) => next(err));
};