var driver = require('../utility/driver');

var user = {};

user.insert = function (record, callback) {
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      callback(err);
    } else {
      connection.query("INSERT INTO user SET ?", record, function (err, res) {
        connection.release();
        if (err) {
          console.dir(err);
        } else {
          callback(err, res.insertId);
        }
      });
    }
  });
};

user.update = function (id, record, callback) {
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      callback(err);
    } else {
      var query = "UPDATE user SET ? WHERE id=" + id;
      console.log(query);

      connection.query(query, record, function (err) {
        connection.release();
        callback(err);
      });
    }
  });
};

module.exports = user;
