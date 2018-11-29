const express = require('express');
let mongoose = require('libs/mongoose');
const bodyParser = require("body-parser");
const hbs = require("hbs");
const config = require('config');
const log = require('libs/log')(module);
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

let gm = require('gm');
let fs = require('fs');
let multer  = require('multer');
let upload = multer({ dest: 'uploads/' });

let router = express.Router();

hbs.registerHelper('if_equal', function(a, b, opts) {
    return a === b ? opts.fn(this) : opts.inverse(this);
});

const app = express();

hbs.registerPartials(__dirname + "/views/partials");
app.set("view engine", "hbs");

app.use(express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: config.get('session:secret'),
    key: config.get('session:key'),
    cookie: config.get('session:cookie'),
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));

app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    res.locals.night = req.session.night || false;
    log.info(`Url: ${req.url}, Method: ${req.method}, ID: ${req.sessionID}, user: ${res.locals.user}`);
    next();
});

app.use(router);

require('routes')(app);

app.post('/uploadphoto', upload.single('photo'), function (req, res, next) {
    if (!res.locals.user) return next(new Error("Вы не авторизованы!"));

    if (req.file.mimetype != "image/png" && req.file.mimetype != "image/jpeg")
        return res.status(403).json({message: "bad format"});
    console.log('dir: ' + __dirname + "\\" + req.file.path);

    gm(__dirname + "\\" + req.file.path)
        .resize('200', '200', '^')
        .gravity('Center')
        .crop('200', '200')
        .noProfile()
        .write(__dirname + "\\public\\images\\users\\" + res.locals.user + ".png", function(err) {
            if (err) res.status(403).json({message: err.message});
            res.json({message: "profile picture updated"});
            fs.unlink(__dirname + "\\" + req.file.path, function(err) {
                console.log(err);
            });
        });
});

app.post('/deletephoto', function (req, res, next) {
    if (!res.locals.user) return next(new Error("Вы не авторизованы!"));

    fs.unlink(__dirname + "\\public\\images\\users\\" + res.locals.user + ".png", function(err) {
        console.log(err);
        res.json({message: "profile picture deleted"});
    });
});

app.post('/chengetheme', function (req, res, next) {
    res.locals.night = req.session.night = !req.session.night;
    res.json({night: req.session.night});
});

app.use(function(req, res) {
    res.status(404);
    res.render("error.hbs", { title: '404: File Not Found', number: '404', error: "Страница не найдена!", url: req.url });
});

app.use(function(err, req, res, next) {
    log.error(err.message);
    res.status(500);
    res.render("error.hbs", { title: '500: Internal Server Error', number: '500', error: err.message, url: req.url });
});

app.listen(config.get('port'), function () {
    log.info('Express server listening on port ' + config.get('port'));
});

