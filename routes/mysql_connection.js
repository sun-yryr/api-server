var mysql = require('mysql');
var connection = mysql.createConnection(process.env.MYSQL_URL);
module.exports = connection;

/* 使い方
var connection = require(このファイルへのパス);
connection.query(query, function(err, rows) {
    rowsは二次元配列的考え
})
*/