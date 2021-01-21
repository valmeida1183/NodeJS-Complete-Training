//const http = require('http'); // para usar o node puro, sem o express.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const adminRoutes = require('./routes/admin');
const defaultRoutes = require('./routes/shop');

// configuração do express.js
const app = express();
/* app.use((req, res, next) => {
    console.log('In the middleware!!');
    next(); // permite que o request continue para o próximo middleware.
}); */

//app.use(express.urlencoded({ extended: false })); // usar o parser default do do express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // identifica a pasta que vai servir os arquivos estáticos.

app.use('/admin', adminRoutes); // importa os endpoints de um arquivo externo de rotas.
app.use(defaultRoutes);
app.use((req, res, next) => {
    res.status(404)
       .sendFile(path.join(__dirname, 'views', '404.html'));
});

app.listen(3000);

/* const server = http.createServer(app);
server.listen(3000); */