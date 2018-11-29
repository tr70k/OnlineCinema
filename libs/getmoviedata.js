const config = require('config');
const request = require('request');
const cyrillicToTranslit = require('cyrillic-to-translit-js');

/**
 * Receives information about the movie by its title "title"
 * or Kinopoisk ID "kinopoisk_id" and IMDb ID "imdb_id".
 *
 * @param {String} title
 * @param {String} imdb_id
 * @param {String} kinopoisk_id
 * @returns {Promise}
 */
exports.get = function({title, imdb_id, kinopoisk_id}) {

    if (title) title = title.toLowerCase();
    let url = "https://hdbaza.com/api/movies?uh=" + config.get('hdbaza:user_hash')
        + (kinopoisk_id ? "&kpid=" + kinopoisk_id : "&t=" + encodeURI(title));

    let info = {};

    return new Promise(function (resolve, reject) {
        request(url, function (error, response, body) {
            console.log('url: ', url, ' statusCode: ', response && response.statusCode);
            if (error) return reject(new Error("HDbaza: не отвечает!\n(" + error + ")"));

            let data = JSON.parse(body);
            if (data.status == "error") return reject(new Error("HDbaza: произошла ошибка!\n(" + data.message + ")"));

            data = data.data;
            if (!data.length) return reject(new Error("HDbaza: ничего не найдено, попробуйте поиск по IMDBb id и Кинопоиск id!"));

            if (data.length > 1 && title) info.kinopoisk_data = data.find((element) => element.title.toLowerCase() === title);
            else info.kinopoisk_data = data[0];
            if (!info.kinopoisk_data) return reject(new Error("HDbaza: ничего не найдено, попробуйте поиск по IMDBb id и Кинопоиск id!"));

            if (!info.kinopoisk_data.title_orig)
                info.kinopoisk_data.title_orig = cyrillicToTranslit({ preset: "uk" }).transform(info.kinopoisk_data.title);

            url = "https://www.omdbapi.com/?" + (imdb_id ? "i=" + imdb_id : "t=" + encodeURI(info.kinopoisk_data.title_orig))
                + "&y=" + info.kinopoisk_data.year + "&plot=full&r=json&apikey=" + config.get('omdbapi:apikey');

            request(url, function (error, response, body) {
                console.log('url: ', url, ' statusCode: ', response && response.statusCode);
                if (error) return reject(new Error("OMDbApi: не отвечает!\n(" + error + ")"));

                info.imdb_data = JSON.parse(body);
                if (info.imdb_data.Response == "False") return reject(new Error("OMDbApi: произошла ошибка!\n(" + info.imdb_data.Error + ")"));

                resolve(info);
            });
        });
    });
};