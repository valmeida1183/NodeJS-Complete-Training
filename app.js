//const http = require('http'); // para usar o node puro, sem o express.js
const express = require("express");
const bodyParser = require("body-parser");
// const expressHbs = require("express-handlebars");
const path = require("path");

const adminRoutes = require("./routes/admin");
const defaultRoutes = require("./routes/shop");

const errorController = require('./controllers/error');
const sequelize = require('./utils/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

// configuração do express.js
const app = express();
/* app.use((req, res, next) => {
    console.log('In the middleware!!');
    next(); // permite que o request continue para o próximo middleware.
}); */

// EJS template engine
app.set('view engine', 'ejs'); // configura o template engine.

// HandleBars template Engine
/* app.engine(
  "hbs",
  expressHbs({
    layoutsDir: "views/layouts/",
    defaultLayout: "main-layout",
    extname: "hbs",
  })
);
app.set("view engine", "hbs"); */ // configura o template engine.

// Pug template engine
//app.set('view engine', 'pug'); // configura o template engine.
app.set("views", "views"); // configura a pasta onde ficam os templates

//app.use(express.urlencoded({ extended: false })); // usar o parser default do do express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // identifica a pasta que vai servir os arquivos estáticos.

app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use("/admin", adminRoutes); // importa os endpoints de um arquivo externo de rotas.
app.use(defaultRoutes);
app.use(errorController.get404);

Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
//ou (a inversão da relação, é opcional não precisa constar)
User.hasMany(Product);

User.hasOne(Cart);
//ou (a inversão da relação, é opcional não precisa constar)
Cart.belongsTo(User);
// Many to Many relationship
Cart.belongsToMany(Product, { through: CartItem});
Product.belongsToMany(Cart, { through: CartItem });
// One to many relationship
Order.belongsTo(User);
User.hasMany(Order);

Order.belongsToMany(Product, { through: OrderItem });

sequelize
  //.sync({ force: true }) // force true recria o banco toda vez e não deve ser usado em produção
  .sync()
  .then(result => {
    return User.findByPk(1);
    //console.log(result);    
  })
  .then(user => {
    if (!user) {
      User.create({name: 'Vinicius', email:'dummy@gmail.com'});      
    }
    return user;
  })
  .then(user => {
    user.createCart();    
  })
  .then(cart => {
    app.listen(3000);
  })
  .catch(err => console.log(err));

/* const server = http.createServer(app);
server.listen(3000); */
