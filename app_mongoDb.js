const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');

const session = require('express-session');
const mongoose = require('mongoose');
const mongoDbSessionStoreConnect = require('connect-mongodb-session');
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// seta as variáveis de ambiemte para o objeto process.env
dotenv.config();

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const errorController = require('./controllers/error');
const mongoDb = require('./utils/database_mongoDb');

//Models
const User = require('./models/mongoDb/user');
const { use } = require('./routes/admin');
const { compress } = require('pdfkit');

// configuração do express.js
const app = express();

// configuração da session para ser salva no mongoDb
const MongoDbSessionStore = mongoDbSessionStoreConnect(session);
const sessionStore = new MongoDbSessionStore({
    uri: mongoDb.dbUrl.split('?')[0], // remover o trecho "?retryWrites=true&w=majority" da connection string
    collection: 'sessions',
});

//support parsing of application/x-www-form-urlencoded post data (ou seja os forms nativos do html)
app.use(express.urlencoded({ extended: true }));

// support parsing of multipart/form-data post data (ou seja os forms contendo textos e arquivos binários)
const filestorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/images');
    },
    filename: (req, file, callback) => {
        callback(null, `${Date.now()}-${file.originalname}`);
    },
});

const fileFilter = (req, file, callback) => {
    const validMimeTypes = new Set(['image/png', 'image/jpg', 'image/jpeg']);
    const isValidMimeType = validMimeTypes.has(file.mimetype);

    callback(null, isValidMimeType);
};
app.use(multer({ storage: filestorage, fileFilter: fileFilter }).single('image'));

// identifica a pasta que vai servir os arquivos estáticos.
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public/images', express.static(path.join(__dirname, 'public/images')));

// configura a sessão
app.use(
    session({
        secret: `${process.env.API_SESSION_SECRET}`,
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
    })
);

// seta a config do csrf
const csrfProtection = csrf();
app.use(csrfProtection);

// connect flash para armazenar as messages de validação na session por um curto período de tempo.
app.use(flash());

// EJS template engine
app.set('view engine', 'ejs'); // configura o template engine.
app.set('views', 'views'); // configura a pasta onde ficam os templates

//seta o helmet (middleware que seta headers http de segurança)
app.use(helmet());
//seta o compression (middleware de compressão dos assets)
app.use(compression());
//seta o morgan (middleware para realizar logging dos requests)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }

    User.findById(req.session.user._id)
        .then(user => {
            if (!user) return next();

            req.user = user;
            next();
        })
        .catch(err => {
            throw new Error(err);
        });
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', adminRoutes); // importa os endpoints de um arquivo externo de rotas.
app.use(shopRoutes);
app.use(authRoutes);
app.get('/500', errorController.get500);

app.use(errorController.get404);

// middleware que trata erros tem 4 parâmetros, onde o primeiro é um objeto do tipo Error do javascript.
app.use((error, req, res, next) => {
    // res.status(error.httpStatusCode).render(...);
    console.log(error);
    res.redirect('/500');
});

// Configura o HTTPS
/* const privateKey = fs.readFileSync('server.key');
const certificade = fs.readFileSync('server.cert'); */

mongoose
    .connect(mongoDb.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        //https.createServer({ key: privateKey, cert: certificade }, app).listen(process.env.APP_PORT || 3000); // exemplo de como habilitar o ssl manualmente
        app.listen(process.env.PORT || 3000);
        console.log(
            '\x1b[32m', // set green color
            `--------- Application is Running!!! [${process.env.NODE_ENV}] ---------`
        );
        console.log('\x1b[0m');
    })
    .catch(err => console.log(err));
