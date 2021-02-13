const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const errorController = require('./controllers/error');
const mongoConnect = require('./utils/database_mongoDb').mongoConnect;

//Models
const User = require('./models/mongoDb/user');

// configuração do express.js
const app = express();

// EJS template engine
app.set('view engine', 'ejs'); // configura o template engine.
app.set("views", "views"); // configura a pasta onde ficam os templates

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // identifica a pasta que vai servir os arquivos estáticos.

app.use((req, res, next) => {
  User.findById('6020505dacd7686ed541fef0')
    .then(user => {
      req.user = new User(user.name, user.email, user._id, user.cart);
      next();
    })
    .catch(err => console.log(err));    
});

app.use("/admin", adminRoutes); // importa os endpoints de um arquivo externo de rotas.
app.use(shopRoutes);
app.use(errorController.get404);

mongoConnect(() => {    
    app.listen(3000);
});