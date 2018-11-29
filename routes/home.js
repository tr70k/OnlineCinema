let Movie = require('models/movie').Movie;
let Genre = require('models/genre').Genre;

exports.get = function(req, res, next) {
    req.query.find = (req.query.find) ?
        req.query.find.trim().replace(/\s+/g, "_").toLowerCase().replace(/[&\?\*\.]/g, '') : "";
    let find = req.query.find.replace(/_/g, " ");
    let req_genres = (req.query.genre) ? req.query.genre.split('.') : [];
    let type = (req.query.type == "movie") ? 1 : (req.query.type == "series") ? 2 : 0;
    let one_page_count = (req.query.count == "10") ? 10 : (req.query.count == "30") ? 30 :
        (req.query.count == "40") ? 40 : (req.query.count == "50") ? 50 : 20;
    let title = (find) ? `Результаты по запросу "${find}"` + ((type) ? (type == 1) ? " - фильмы" : " - сериалы" : "")
        : (!type) ? "Все фильмы и сериалы" : (type == 1) ? "Все фильмы" : "Все сериалы";
    let params = {};
    if (find.length) params.$or = [{title: new RegExp(find, 'i')}, {title_orig: new RegExp(find, 'i')}];
    let options = {};
    let settings_sort_type = 0;
    let sort_type = settings_sort_type = (req.query.stype == "desc") ? 1 : -1;
    let settings_sort = 0;
    switch (req.query.sort) {
        case "release": options.sort = {year: sort_type, _id: -1}; settings_sort = 1; break;
        case "alphabetically": options.sort = {title: (0 - sort_type)}; settings_sort = 2; break;
        default: options.sort = {_id: sort_type}; break;
    }
    Genre.find({count: {$gt: 0}}, {_id: false}, {sort: {title: 1}})
        .then((all_genres) => {
            if (all_genres && all_genres.length) {
                let movie_genres = all_genres.filter((item) => req_genres.indexOf(item.title_orig) + 1);
                if (movie_genres && movie_genres.length) {
                    req_genres = movie_genres.map(item => item.title_orig);
                    title += " жанра " + movie_genres.map(item => item.title).join(', ');
                    params.genres = {$all: movie_genres.map(item => item.number)};
                }
                else req_genres = [];
            }
            if (type) params.is_multiseries = type - 1;
            return Promise.all([
                Movie.find(params, {_id: false}, options),
                Genre.getAllGenres(),
                Promise.resolve(all_genres)
            ]);
        })
        .then((data) => {
            let count = Math.ceil(data[0].length / one_page_count);
            let page = (!req.query.page || req.query.page < 1) ? 1 : (req.query.page > count) ? count : +req.query.page || 1;

            let movies = data[0].slice((page - 1) * one_page_count, page * one_page_count);

            for (let i = 0; i < movies.length; i++) {
                movies[i].genre = movies[i].genres.map((item) => data[1][item]).join(', ');
            }

            let settings_genres = data[2].map((item) => ({
                title: item.title,
                title_orig: item.title_orig,
                selected: (req_genres.indexOf(item.title_orig) + 1)
            }));

            let page_url = "?"
                + ((req.query.find) ? "find=" + req.query.find + "&" : "")
                + ((req_genres.length) ? "genre=" + req_genres.join('.') + "&" : "")
                + ((type) ? "type=" + req.query.type + "&" : "")
                + ((req.query.sort == "alphabetically" || req.query.sort == "release") ? "sort=" + req.query.sort + "&" : "")
                + ((req.query.stype == "desc") ? "stype=desc&" : "")
                + ((one_page_count != 20) ? "count=" + one_page_count + "&" : "")
                + "page=";
            console.log("page_url", page_url);
            let prev_page = (page > 1) ? (page - 1) : 0;
            let next_page = (page < count) ? (page + 1) : 0;
            res.render("home.hbs", {movies, page_url, prev_page, page, next_page, count, title, find,
                settings_sort, settings_sort_type, settings_genres, settings_type: type, settings_count: one_page_count});
        })
        .catch((err) => next(err));
};