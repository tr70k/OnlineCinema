const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Scheme for the table "Genres" in the database.
 *
 * number       - index for genre
 * count        - count of movies with this genre
 * title_orig   - genre title in Latin
 * title        - genre title in Cyrillic
 * description  - genre description
 */
let genreScheme = new Schema({
    number: {
        type: Number,
        min: 1,
        max: 50,
        required: true
    },
    count: {
        type: Number,
        default: 0,
        required: true
    },
    title_orig: {
        type: String,
        lowercase: true,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});

/**
 * Return all genres array [genre.number] => genre.title
 *
 * @returns {Promise}
 */
genreScheme.statics.getAllGenres = function() {
    let Genre = this;
    return Genre.find({}, {title: true, number: true, _id: false})
        .then((genres) => {
            if (!genres) throw new Error("genres not found");
            let arr = {};
            for (let i = 0; i < genres.length; i++)
                arr[genres[i].number] = genres[i].title;
            return arr;
        })
};

/**
 * For genres with "number" from the array "numbers" creates an array with their "title" and "title_orig".
 *
 * @param {Array} numbers
 * @returns {Promise}
 * @throws Will throw an error if genres with "number" from the array "numbers" not found.
 * @see genreScheme.statics.getNumbersByTitles
 * @see genreScheme.statics.getNumbersByOrigTitles
 * @see genreScheme.statics.getTitlesByOrigTitles
 */
genreScheme.statics.getTitlesByNumbers = function(numbers) {
    let Genre = this;
    return Genre.find({number: {$in : numbers}}, {title: true, title_orig: true, _id: false})
        .then((genres) => {
            if (!genres) throw new Error("genres not found");
            return genres;
        });
};

/**
 * For genres with "title" from the array "titles" creates an array with their "number".
 *
 * @param {Array} titles
 * @returns {Promise}
 * @throws Will throw an error if genres with "title" from the array "titles" not found.
 * @see genreScheme.statics.getNumbersByOrigTitles
 * @see genreScheme.statics.getTitlesByNumbers
 * @see genreScheme.statics.getTitlesByOrigTitles
 */
genreScheme.statics.getNumbersByTitles = function(titles) {
    let Genre = this;
    return Genre.find({title: {$in : titles}}, {number: true, _id: false})
        .then((numbers) => {
            if (!numbers) throw new Error("numbers not found");
            return numbers.map((item) => item.number);
        });
};

/**
 * For genres with "title_orig" from the array "titles_orig" creates an array with their "number".
 *
 * @param {Array} titles_orig
 * @returns {Promise}
 * @throws Will throw an error if genres with "title_orig" from the array "titles_orig" not found.
 * @see genreScheme.statics.getNumbersByTitles
 * @see genreScheme.statics.getTitlesByNumbers
 * @see genreScheme.statics.getTitlesByOrigTitles
 */
genreScheme.statics.getNumbersByOrigTitles = function(titles_orig) {
    let Genre = this;
    return Genre.find({title_orig: {$in : titles_orig}}, {number: true, _id: false})
        .then((numbers) => {
            if (!numbers) throw new Error("numbers not found");
            return numbers.map((item) => item.number);
        });
};

/**
 * For genres with "title_orig" from the array "titles_orig" creates an array with their "titles".
 *
 * @param {Array} titles_orig
 * @returns {Promise}
 * @throws Will throw an error if genres with "title_orig" from the array "titles_orig" not found.
 * @see genreScheme.statics.getNumbersByOrigTitles
 * @see genreScheme.statics.getNumbersByTitles
 * @see genreScheme.statics.getTitlesByNumbers
 */
genreScheme.statics.getTitlesByOrigTitles = function(titles_orig) {
    let Genre = this;
    return Genre.find({title_orig: {$in : titles_orig}}, {title: true, _id: false})
        .then((titles) => {
            if (!titles) throw new Error("titles not found");
            console.log(titles_orig + " => " + titles);
            return titles.map((item) => item.title);
        });
};

/**
 * Increases the "count" for genres with numbers from the array "numbers".
 *
 * @param {Array} numbers
 * @returns {Promise}
 * @see genreScheme.statics.decCount
 */
genreScheme.statics.incCount = function(numbers) {
    return this.updateMany({number: {$in : numbers}}, {$inc: {count: 1}});
};

/**
 * Decreases the "count" for genres with numbers from the array "numbers".
 *
 * @param {Array} numbers
 * @returns {Promise}
 * @see genreScheme.statics.incCount
 */
genreScheme.statics.decCount = function(numbers) {
    return this.updateMany({number: {$in : numbers}}, {$inc: {count: -1}});
};

exports.Genre = mongoose.model('Genre', genreScheme);