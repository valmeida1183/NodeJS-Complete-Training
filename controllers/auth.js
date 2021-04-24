const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const User = require('../models/mongoDb/user');
const mailer = require('../utils/mailer');

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    message = message.length ? message[0] : null;

    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: message,
        oldInputs: { email: null, password: null },
        validationErrors: [],
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    message = message.length ? message[0] : null;

    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        errorMessage: message,
        oldInputs: { name: null, email: null, password: null, confirmPassword: null },
        validationErrors: [],
    });
};

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            errorMessage: errors.array()[0].msg,
            oldInputs: { email, password },
            validationErrors: errors.array(),
        });
    }

    User.findOne({ email })
        .then(user => {
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
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            pageTitle: 'Signup',
            path: '/signup',
            errorMessage: errors.array()[0].msg,
            oldInputs: { name, email, password, confirmPassword },
            validationErrors: errors.array(),
        });
    }
    bcrypt
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

exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    message = message.length ? message[0] : null;

    res.render('auth/reset', {
        pageTitle: 'Reset Password',
        path: '/reset',
        errorMessage: message,
    });
};

exports.postReset = (req, res, next) => {
    if (!req.body.email) {
        req.flash('error', 'No email account was provided.');
        return res.redirect('/reset');
    }

    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            res.redirect('/reset');
        }

        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account with that email found.');
                    return res.redirect('/reset');
                }

                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000; // 3600000 = 1h em milisegundos
                return user.save();
            })
            .then(() => {
                mailer.sendEmail({
                    to: req.body.email,
                    subject: 'Password Reset',
                    html: `
                        <h2>You requested a password reset</h2>
                        <p>Click this <a href="/http://localhost:3000/reset/${token}">link</a> to set new password.</p>
                        <p>This link is valid for one hour</p>
                    `,
                });
                return res.redirect('/');
            })
            .catch(err => console.log(err));
    });
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            let message = req.flash('error');
            message = message.length ? message[0] : null;

            if (!user) {
                req.flash('error', 'Cannot find user with this token, certify that token is not expired.');
                return res.redirect('/reset');
            }

            res.render('auth/new-password', {
                pageTitle: 'New Password',
                path: '/new-password',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token,
            });
        })
        .catch(err => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
    const { password, userId, passwordToken } = req.body;
    let resetUser;

    User.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(password, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(() => {
            res.redirect('/login');
        })
        .catch(err => console.log(err));
};
