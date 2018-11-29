let User = require('models/user').User;

exports.get = function(req, res) {
    if (res.locals.user) return res.redirect('/users/' + res.locals.user);
    res.render('login.hbs');
};

exports.login = function (req, res) {
    User.authorize(req.body.username.toLowerCase(), req.body.password)
        .then(function (user) {
            delete req.session.email;
            delete req.session.code;
            req.session.user = user;
            res.json({user});
        })
        .catch(function (err) {
            res.status(403).json({message: err.message});
        });
};

exports.logout = function (req, res) {
    delete req.session.user;
    res.send({});
};

exports.registration = function (req, res) {
    if (!req.session.email) return res.status(403).json({message: "Для начала получите код подтверждения!"});

    let secureEmail = req.body.email.replace(/^(..)(.*)(..@)/, '$1' + (`{'$2'}`).replace(/./g, '*') + '$3');
    if (!req.session.code || req.body.email != req.session.email || req.body.code != req.session.code) {
        return res.status(403).json({message: "Код " + req.body.code + " не соответствует почте " + secureEmail + "!"});
    }
    // username: a-z 0-9 _
    if (!req.body.username.match(/^[a-zA-Z\d]\w{2,}[a-zA-Z\d]$/)) {
        return res.status(403).json({message: "Имя пользователя может состоять только из 4х и более букв, цифр и символов '_'"});
    }
    User.createnew(req.body.username, req.body.password, req.body.email)
        .then(function (user) {
            req.session.user = user;
            delete req.session.email;
            delete req.session.code;
            res.json({user});
        })
        .catch(function (err) {
            res.status(403).json({message: err.message});
        });
};