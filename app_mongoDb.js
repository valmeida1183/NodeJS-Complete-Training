const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const errorController = require('./controllers/error');
const mongoDb = require('./utils/database_mongoDb');

//Models
const User = require('./models/mongoDb/user');

// configuração do express.js
const app = express();

// EJS template engine
app.set('view engine', 'ejs'); // configura o template engine.
app.set('views', 'views'); // configura a pasta onde ficam os templates

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // identifica a pasta que vai servir os arquivos estáticos.

app.use((req, res, next) => {
    User.findById('602ab5ee17558d45e886b0dd')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use('/admin', adminRoutes); // importa os endpoints de um arquivo externo de rotas.
app.use(shopRoutes);
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
    })
    .catch(err => console.log(err));
