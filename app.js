//const http = require('http'); // para usar o node puro, sem o express.js
const express = require('express');

// configuração do express.js
const app = express();
/* app.use((req, res, next) => {
    console.log('In the middleware!!');
    next(); // permite que o request continue para o próximo middleware.
}); */

app.use('/add-product', (req, res, next) => {
    console.log('In the another middleware!!');
    res.send('<form action="/product" method="POST"><input type="text" name="title"/><button type="submit">Add Product</button></form>');
});

app.use('/', (req, res, next) => {
    console.log('In the another middleware!!');
    res.send('<h1>Hello from Express.js</h1>'); // o último middleware deve devolver o response usando o método send!
});

app.listen(3000);

/* const server = http.createServer(app);
server.listen(3000); */