const User = require('models/user').User;
const sendmail = require('libs/sendmail');

exports.get = function(req, res, next) {
    User.findOne({username: res.locals.user}, {_id: false})
        .then(function (user) {
            if (!user) return next("Пользователь не найден!");
            res.render("useredit.hbs", user);
        })
        .catch((err) => next(err));
};

exports.updatesocialnetworks = function(req, res, next) {
    if ((req.body.telegram && !req.body.telegram.match(/^[\w\-\.]{4,}$/)) ||
        (req.body.twitter && !req.body.twitter.match(/^[\w\-\.]{4,}$/)) ||
        (req.body.vk && !req.body.vk.match(/^[\w\-\.]{4,}$/)) ||
        (req.body.instagram && !req.body.instagram.match(/^[\w\-\.]{4,}$/))) {
        return res.status(403).json({message: "Ссылка на вашу соц. сеть может состоять только из букв, цифр и символов '-', '_' или '.'"});
    }
    let params = {
        telegram: req.body.telegram,
        twitter: req.body.twitter,
        vk: req.body.vk,
        instagram: req.body.instagram
    };
    User.update({ username: res.locals.user }, params, function(err, result) {
        if (err) return res.json({message: err.message});
        res.json({message: "Изменения сохранены!"});
    });
};

exports.sendcodeforemailconfirmation = function(req, res, next) {
    req.session.email = req.body.email.toLowerCase();
    req.session.code = Math.floor(1000 + Math.random() * 9000);

    let secureEmail = req.session.email.replace(/^(..)(.*)(..@)/, '$1' + (`{'$2'}`).replace(/./g, '*') + '$3');

    sendmail.send(req.session.email, 'Код подтверждения', '<h3>Ваш код для подтверждения почты: ' + req.session.code + '</h3>')
        .then(() => res.json({message: ("Код подтверждения отправлен на " + secureEmail + ".")}))
        .catch((err) => res.status(403).json({message: err.message}));
};

exports.updateemail = function(req, res, next) {
    if (!req.session.email) return res.status(403).json({message: "Для начала получите код подтверждения!"});

    let secureEmail = req.body.email.replace(/^(..)(.*)(..@)/, '$1' + (`{'$2'}`).replace(/./g, '*') + '$3');
    if (!req.session.code || req.body.email != req.session.email || req.body.code != req.session.code) {
        return res.status(403).json({message: "Код " + req.body.code + " не соответствует почте " + secureEmail + "!"});
    }
    let params = {
        email: req.body.email
    };
    User.authorize(res.locals.user, req.body.password)
        .then(function (username) {
            return User.update({ username }, params);
        })
        .then(function () {
            delete req.session.email;
            delete req.session.code;
            res.json({message: "Изменения сохранены!"});
        })
        .catch((err) => res.status(403).json({message: err.message}));
};

exports.sendcodeforpasswordchange = function(req, res, next) {
    User.findOne({username: res.locals.user}, {_id: false, email: true})
        .then(function (user) {
            if (!user) throw new Error("Пользователь не найден!");
            req.session.email = user.email;
            req.session.code = Math.floor(1000 + Math.random() * 9000);

            return sendmail.send(req.session.email, 'Код подтверждения', '<h3>Ваш код подтверждения для смены пароля: ' + req.session.code + '</h3>');
        })
        .then(() => {
            let secureEmail = req.session.email.replace(/^(..)(.*)(..@)/, '$1' + (`{'$2'}`).replace(/./g, '*') + '$3');
            res.json({message: ("Код подтверждения отправлен на " + secureEmail + ".")})
        })
        .catch((err) => res.status(403).json({message: err.message}));
};

exports.updatepassword = function(req, res, next) {
    if (!req.session.email) return res.status(403).json({message: "Для начала получите код подтверждения!"});

    let secureEmail = req.session.email.replace(/^(..)(.*)(..@)/, '$1' + (`{'$2'}`).replace(/./g, '*') + '$3');
    if (!req.session.code || req.body.code != req.session.code) {
        return res.status(403).json({message: "Код " + req.body.code + " не соответствует почте " + secureEmail + "!"});
    }

    User.findOne({username: res.locals.user})
        .then(function (user) {
            if (!user) throw new Error("Пользователь не найден!");
            user.password = req.body.password;
            return user.save();
        })
        .then(() => res.json({message: "Изменения сохранены!"}))
        .catch((err) => res.status(403).json({message: err.message}));
};

exports.sendcodeforpasswordrecovery = function(req, res, next) {
    req.session.possibleuser = req.body.username;
    User.findOne({username: req.session.possibleuser}, {_id: false, email: true})
        .then(function (user) {
            if (!user) throw new Error("Пользователь не найден!");
            req.session.email = user.email;
            req.session.code = Math.floor(1000 + Math.random() * 9000);

            return sendmail.send(req.session.email, 'Код подтверждения', '<h3>Ваш код подтверждения для восстановления пароля: ' + req.session.code + '</h3>');
        })
        .then(() => {
            let secureEmail = req.session.email.replace(/^(..)(.*)(..@)/, '$1' + (`{'$2'}`).replace(/./g, '*') + '$3');
            res.json({message: ("Код подтверждения отправлен на " + secureEmail + ".")})
        })
        .catch((err) => res.status(403).json({message: err.message}));
};

exports.recoverpassword = function(req, res, next) {
    if (!req.session.email) return res.status(403).json({message: "Для начала получите код подтверждения!"});

    let secureEmail = req.session.email.replace(/^(..)(.*)(..@)/, '$1' + (`{'$2'}`).replace(/./g, '*') + '$3');
    if (!req.session.code || req.body.code != req.session.code) {
        return res.status(403).json({message: "Код " + req.body.code + " не соответствует почте " + secureEmail + "!"});
    }

    User.findOne({username: req.session.possibleuser})
        .then(function (user) {
            if (!user) throw new Error("Пользователь не найден!");
            user.password = req.body.password;
            return user.save();
        })
        .then(() => {
            req.session.user = req.session.possibleuser;
            delete req.session.possibleuser;
            delete req.session.email;
            delete req.session.code;
            return res.json({user: req.session.user});
        })
        .catch((err) => res.status(403).json({message: err.message}));
};

