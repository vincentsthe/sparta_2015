var conf = require('./../conf');

var driver = {};

var async = require('async');
driver.async = async;

var mysql = require('mysql');
var mysqlpool = mysql.createPool({
  connectionLimit: 1000,
  host: conf.dbHost,
  user: conf.dbUser,
  password: conf.dbPassword,
  database: conf.dbName,
  debug: false
});
driver.mysqlpool = mysqlpool;

module.exports = driver;
