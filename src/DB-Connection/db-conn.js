const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'balaraju'
})

connection.connect(error => {
    if (error) throw error;
    console.log("DB Connected!");
})

module.exports = connection;