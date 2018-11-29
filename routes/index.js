const config = require('config');

let isAuthorized = function(req, res, next) {
    if (!res.locals.user) return next(new Error("Вы не авторизованы!"));
    next();
};

let isAdmin = function(req, res, next) {
    let admins = config.get('admins');
    if (!~admins.indexOf(res.locals.user)) return next(new Error("У вас недостаточно прав доступа!"));
    next();
};

module.exports = function(app) {

    app.get('/', require('./home').get);

    app.get('/login', require('./login').get);
    app.post('/login', require('./login').login);
    app.post('/logout', require('./login').logout);
    app.post('/registration', require('./login').registration);

    app.get('/genres', require('./genres').get);

    app.get('/users/:username', require('./user').get);
    app.post('/likemovie', isAuthorized, require('./user').likemovie);
    app.post('/savereview', isAuthorized, require('./user').savereview);
    app.post('/removereview', isAuthorized, require('./user').removereview);

    app.get('/edit', isAuthorized, require('./useredit').get);
    app.post('/updatesocialnetworks', isAuthorized, require('./useredit').updatesocialnetworks);
    app.post('/sendcodeforemailconfirmation', require('./useredit').sendcodeforemailconfirmation);
    app.post('/updateemail', isAuthorized, require('./useredit').updateemail);
    app.post('/sendcodeforpasswordchange', isAuthorized, require('./useredit').sendcodeforpasswordchange);
    app.post('/updatepassword', isAuthorized, require('./useredit').updatepassword);
    app.post('/sendcodeforpasswordrecovery', require('./useredit').sendcodeforpasswordrecovery);
    app.post('/recoverpassword', require('./useredit').recoverpassword);

    app.get('/movies/:movieurl', require('./movie').get);

    app.get('/addmovie', isAdmin, require('./admin').add);
    app.get('/editmovie', isAdmin, require('./admin').edit);
    app.get('/blockuser', isAdmin, require('./admin').block);
    app.post('/getmoviedata', isAdmin, require('./admin').getdata);
    app.post('/addmovie', isAdmin, require('./admin').addmovie);
    app.post('/editmovie', isAdmin, require('./admin').editmovie);
    app.post('/updatemovie', isAdmin, require('./admin').updatemovie);
    app.post('/deletemovie', isAdmin, require('./admin').deletemovie);
    app.post('/blockuser', isAdmin, require('./admin').blockuser);
    app.post('/unblockuser', isAdmin, require('./admin').unblockuser);
    app.post('/getuserreviews', isAdmin, require('./admin').getuserreviews);
    app.post('/removeuserreviews', isAdmin, require('./admin').removeuserreviews);
    app.post('/removeuserreview', isAdmin, require('./admin').removeuserreview);

};