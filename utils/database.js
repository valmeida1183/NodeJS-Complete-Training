// para usar o mysql2 puramente (mysql2 é tipo um ADO.net);
/* const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Aprenda4tudo',
    database: 'node-complete-guide'
});

module.exports = pool.promise() */;

// Usando o ORM Sequelize
const Sequelize = require('sequelize').Sequelize;
const sequelize = new Sequelize('node-complete-guide', 'root', 'Aprenda4tudo', {
    dialect: 'mysql',
    host: 'localhost',

});

module.exports = sequelize;