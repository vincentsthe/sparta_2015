var driver = require('../utility/driver');

var user = {};

user.insert = function (record, callback) {
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      callback(err);
    } else {
      connection.query("INSERT INTO user SET ?", record, function (err, res) {
        if (err) {
          console.dir(err);
        } else {
          callback(err, res.insertId);
        }
      });
    }
  });
};


user.findById = function () {

};
module.exports = user;