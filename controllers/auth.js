const User = require('../models/mongoDb/user');

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: req.isLoggedIn,
    });
};

exports.postLogin = (req, res, next) => {
    User.findById('602ab5ee17558d45e886b0dd')
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            // normalmente não é preciso usar o SAVE após setar uma variável na session, mas nesse caso
            // queremos garantir que o user só será redirecionado após a session estar salva
            req.session.save(err => {
                console.log(err);
                res.redirect('/');
            });
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};
