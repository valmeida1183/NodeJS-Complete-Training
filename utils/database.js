const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Aprenda4tudo',
    database: 'node-complete-guide'
});

module.exports = pool.promise();