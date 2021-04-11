const bcrypt = require('bcryptjs');

const User = require('../models/mongoDb/user');
const mailer = require('../utils/mailer');

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    message = message.length ? message[0] : null;

    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: message,
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    message = message.length ? message[0] : null;

    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        errorMessage: message,
    });
};

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;

    User.findOne({ email })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email or password.');
                return res.redirect('/login');
            }
            bcrypt
                .compare(password, user.password)
                .then(isValidPassword => {
                    if (isValidPassword) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        // normalmente não é preciso usar o SAVE após setar uma variável na session, mas nesse caso
                        // queremos garantir que o user só será redirecionado após a session estar salva
                        return req.session.save(err => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    req.flash('error', 'Invalid email or password.');
                    res.redirect('/login');
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login');
                });
        })
        .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
    const { name, email, password, confirmPassword } = req.body;

    User.findOne({ email })
        .then(user => {
            if (user) {
                req.flash('error', 'email exists already, pleasepcik a different one.');
                return res.redirect('/signup');
            }

            return bcrypt
                .hash(password, 12)
                .then(hashPassword => {
                    const newUser = new User({
                        name,
                        email,
                        password: hashPassword,
                        cart: { items: [] },
                    });

                    newUser.save();
                })
                .then(() => {
                    return mailer.sendEmail({
                        to: email,
                        subject: 'Signup Succeeded',
                        html: '<h1>You successfully sign up!</h1>',
                    });
                })
                .then(() => {
                    // redireciona para a página inicial após o signup e o email enviado.
                    res.redirect('/');
                });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};
