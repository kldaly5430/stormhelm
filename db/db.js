const mysql = require('mysql');

// Create connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
});

//connect
connection.connect((err) => { 
    if(err){
        throw err;
    }
    console.log('Mysql connected');
});

module.exports = connection;