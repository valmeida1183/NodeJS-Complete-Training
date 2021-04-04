const dotenv = require('dotenv');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mongoDbSessionStoreConnect = require('connect-mongodb-session');
const path = require('path');

// seta as variáveis de ambiemte para o objeto process.env
dotenv.config();

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const errorController = require('./controllers/error');
const mongoDb = require('./utils/database_mongoDb');

//Models
const User = require('./models/mongoDb/user');

// configuração do express.js
const app = express();

// configuração da session para ser salva no mongoDb
const MongoDbSessionStore = mongoDbSessionStoreConnect(session);
const sessionStore = new MongoDbSessionStore({
    uri: mongoDb.dbUrl.split('?')[0], // remover o trecho "?retryWrites=true&w=majority" da connection string
    collection: 'sessions',
});

//support parsing of application/x-www-form-urlencoded post data (ou seja os forms nativos do html)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // identifica a pasta que vai servir os arquivos estáticos.
app.use(
    session({
        secret: `${process.env.API_SESSION_SECRET}`,
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
    })
);

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }

    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

// EJS template engine
app.set('view engine', 'ejs'); // configura o template engine.
app.set('views', 'views'); // configura a pasta onde ficam os templates

/* app.use((req, res, next) => {
    User.findById('602ab5ee17558d45e886b0dd')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
}); */

app.use('/admin', adminRoutes); // importa os endpoints de um arquivo externo de rotas.
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

mongoose
    .connect(mongoDb.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: 'Vinicius',
                    email: 'vinicius@gmail.com',
                    cart: {
                        items: [],
                    },
                });

                user.save();
            }
        });
        app.listen(3000);
        console.log(
            '\x1b[32m', // set green color
            '--------- Application is Running!!! ---------'
        );
    })
    .catch(err => console.log(err));
