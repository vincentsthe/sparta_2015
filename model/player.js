var driver = require('../utility/driver');

var player = {};

player.insert = function (record, callback) {
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      callback(err);
    } else {
      connection.query("INSERT INTO player SET ?", record, function (err) {
        connection.release();
        callback(err);
      });
    }
  });
};

player.update = function (id, record, callback) {
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      callback(err);
    } else {
      var query = "UPDATE player SET ? WHERE id=" + id;
      console.log(query);

      connection.query(query, record, function (err) {
        connection.release();
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
      var query = "SELECT p.*, u.foto, g.nama guild_name, pa.party_name party_name FROM player p"
                  + " LEFT JOIN user u ON p.id=u.id"
                  + " LEFT JOIN party pa ON pa.id=p.party_id"
                  + " LEFT JOIN guild g ON g.id=p.guild_id"
                  + " WHERE p.id = " + id;
      console.log(query);

      connection.query(query, function (err, rows) {
        connection.release();
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

player.getPlayerBasicInfoById = function (id, callback) {
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      console.dir(err);
    } else {
      var query = "SELECT p.fullname, p.nickname, u.foto FROM player p"
                  + " LEFT JOIN user u ON p.id=u.id"
                  + " WHERE p.id = " + id;
      console.log(query);

      connection.query(query, function (err, rows) {
        connection.release();
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

player.getPlayerDetailedInfoByNIM = function (id, callback) {
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      console.dir(err);
    } else {
      var query = "SELECT *, g.nama guild_name FROM player p"
                  + " LEFT JOIN user u ON p.id=u.id"
                  + " LEFT JOIN party pa ON pa.id=p.party_id"
                  + " LEFT JOIN guild g ON g.id=p.guild_id"
                  + " WHERE u.nim_tpb = " + id;
      console.log(query);

      connection.query(query, function (err, rows) {
        connection.release();
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

player.getQuestList = function (id, user_job, callback) {
  var data = [];
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      console.dir(err);
    } else {

      var option1 = "";
      var option2 = " where q.id = ";

      if ( user_job <= 1 ) {
        option1 = " where now() >= start_date and now() <= end_date";
        option2 = " and q.id = ";
      }

      if ( id == 0 ) {
        var query = "SELECT q.*" +
          " FROM quest_list q" +
          option1 +
          " ORDER BY end_date ASC";
          console.log(query);
      } else {
        var query = "SELECT *" +
          " FROM quest_list q" +
          option1 +
          option2 + id;     
          console.log(query);          
      }

      connection.query(query, function (err, row) {
        connection.release();
        if (err) {
          console.dir(err);
        } else {
          for (var i = 0; i < row.length; i++) {
            var record = {};
            record.id = row[i].id;
            record.name = row[i].name;
            record.description = row[i].description;
            record.end_date = row[i].end_date;
            record.exp = row[i].exp;

            data.push(record);
          }

          if ( id == 0 ) {
            callback(data);
          } else {
            callback(data[0]);            
          }
        }
      });

    }
  });
};

player.getAllQuestDetail = function (id, callback) {
  var data = [];
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      console.dir(err);
    } else {

      var query = "SELECT *" +
        " FROM quest_list q";   
        console.log(query);  

      connection.query(query, function (err, row) {
        connection.release();
        if (err) {
          console.dir(err);
        } else {
          for (var i = 0; i < row.length; i++) {
            var record = {};
            record.id = row[i].id;
            record.name = row[i].name;
            record.description = row[i].description;
            record.end_date = row[i].end_date;
            record.exp = row[i].exp;

            data.push(record);
          }

          callback(data);
        }
      });

    }
  });
};

player.getQuestDetail = function (id, callback) {
  var data = [];
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      console.dir(err);
    } else {

      var query = "SELECT *" +
        " FROM quest_list q" +
        " where q.id = " + id;     
        console.log(query);  

      connection.query(query, function (err, row) {
        connection.release();
        if (err) {
          console.dir(err);
        } else {
          for (var i = 0; i < row.length; i++) {
            var record = {};
            record.id = row[i].id;
            record.name = row[i].name;
            record.description = row[i].description;
            record.end_date = row[i].end_date;
            record.exp = row[i].exp;

            data.push(record);
          }

          callback(data[0]);
        }
      });

    }
  });
};

player.getQuestStatus = function (id, nim, callback) {
  var data = [];
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      console.dir(err);
    } else {
      var query = "SELECT DISTINCT player_id" +
        " FROM quest_submitted" + 
        " WHERE quest_id = " + id;

      if ( id == 0 ) {
        query = "SELECT * FROM ("
                  + " SELECT * FROM ("
                      + " SELECT player_id, file, time, quest_id"
                      + " FROM quest_submitted"
                      + " ORDER BY time DESC"
                  + " ) as t1"
                  + " GROUP BY player_id, quest_id "
                  + " ) as u"
                  + " LEFT JOIN user p ON u.player_id = p.id"
                  + " WHERE p.nim_tpb='" + nim + "'";
      }

      console.log(query);

      connection.query(query, function (err, row) {
        connection.release();
        if (err) {
          console.dir(err);
        } else {
          for (var i = 0; i < row.length; i++) {
            var record = {};
            if ( id == 0 ) {
              record.quest_id = row[i].quest_id;
              record.file = row[i].file;
            }
            if ( nim == 0 ) {
              record.player_id = row[i].player_id;
            }
            data.push(record);
          }
          callback(data);
        }
      });

    }
  });
};

player.uploadQuest = function (record, callback) {
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      callback(err);
    } else {
      connection.query("INSERT INTO quest_submitted SET ?", record, function (err) {
        connection.release();
        callback(err);
      });
    }
  });
};

module.exports = player;
