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

player.getPlayerDashboardInfoById = function (id, callback) {
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      console.dir(err);
    } else {
      var query = "SELECT p.*, u.foto, pa.party_name party_name, g.nama guild_name FROM player p"
                  + " LEFT JOIN user u ON p.id=u.id"
                  + " LEFT JOIN party pa ON pa.id=p.party_id"
                  + " LEFT JOIN guild g ON g.id=p.guild_id"
                  + " WHERE p.id=" + id;
      console.log(query);

      connection.query(query, function (err, rows) {
        if (err) {
          console.dir(err);
        } else {
          var info = rows[0];
          callback(info);
        }
      });
    }
  });
};

module.exports = player;