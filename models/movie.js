const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Genre = require('models/genre').Genre;

/**
 * Scheme for the table "Movies" in the database.
 *
 * url          - url for movie
 * title_orig   - movie title in Latin
 * title        - movie title in Cyrillic
 * imdb_id      - imdb movie id
 * kinopoisk_id - kinopoisk mivie id
 * genres       - array of numbers for movie genres
 * year         - movie release year
 * poster       - url for movie poster
 * description  - movie description
 */
let movieScheme = new Schema({
    url: {
        type: String,
        lowercase: true,
        required: true,
        unique: true
    },
    title_orig: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    imdb_id: {
        type: String,
        required: true
    },
    kinopoisk_id: {
        type: Number,
        required: true
    },
    genres: {
        type: [Number],
        required: true
    },
    year: {
        type: Number,
        min: 1000,
        max: 9999,
        required: true
    },
    poster: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    is_multiseries: {
        type: Boolean,
        required: true
    }
});

/**
 * Add new movie to database.
 * Convert genre titles array to genre numbers array.
 * Save movie to database. Update genre counts. Return movie title.
 *
 * @param {Object} data
 * @returns {Promise}
 * @throws Will throw an error if genre with "url" exist in database.
 * @see movieScheme.statics.upd
 * @see movieScheme.statics.del
 */
movieScheme.statics.createnew = function(data) {
    let Movie = this;
    return Movie.findOne({url: data.url})
        .then((movie) => {
            if (movie) throw new Error("that url is taken");
            return Genre.getNumbersByTitles(data.genres);
        })
        .then((genres) => {
            data.genres = genres;
            return Movie.create(data);
        })
        .then((movie) => Genre.incCount(movie.genres))
        .then(() => ({title: data.title, url: data.url}));
};

/**
 * Update movie in database.
 * Update genre counts.
 *
 * @param {Object} data
 * @returns {Promise}
 * @throws Will throw an error if genre with "data.url" exist in database.
 * @see movieScheme.statics.createnew
 * @see movieScheme.statics.del
 */
movieScheme.statics.upd = function(data) {
    let Movie = this;
    return Movie.findOne({url: data.url})
        .then((movie) => {
            if (!movie) throw new Error("movie not found");
            return Genre.decCount(movie.genres);
        })
        .then(() => Genre.getNumbersByTitles(data.genres))
        .then((genres) => {
            data.genres = genres;
            return Movie.findOneAndUpdate({url: data.url}, data);
        })
        .then(() => Genre.incCount(data.genres))
};

/**
 * Delete movie from database.
 * Update genre counts.
 *
 * @param {String} url
 * @returns {Promise}
 * @throws Will throw an error if genre with "url" do not exist in database.
 * @see movieScheme.statics.createnew
 * @see movieScheme.statics.upd
 */
movieScheme.statics.del = function(url) {
    let Movie = this;
    return Movie.findOne({url})
        .then((movie) => {
            if (!movie) throw new Error("movie not found");
            return Promise.all([
                Movie.findByIdAndDelete(movie._id),
                Genre.decCount(movie.genres)
            ]);
        });
};

exports.Movie = mongoose.model('Movie', movieScheme);