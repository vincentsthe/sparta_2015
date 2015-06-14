var driver = require('../utility/driver');

var player = {};

player.insert = function (record, callback) {
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      callback(err);
    } else {
      connection.query("INSERT INTO player SET ?", record, function (err) {
        callback(err);
      });
    }
  });
};

module.exports = player;