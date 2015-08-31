var md5 = require('MD5');
var driver = require('../utility/driver');

var admin = {};

admin.addNews = function (record, callback) {
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      callback(err);
    } else {
      connection.query("INSERT INTO news SET ?", record, function (err, res) {
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

admin.addQuest = function (record, callback) {
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      callback(err);
    } else {
      connection.query("INSERT INTO quest_list SET ?", record, function (err, res) {
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

admin.deleteQuest = function (id, callback) {
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      callback(err);
    } else {
      connection.query("DELETE FROM quest_list WHERE id = ?", id, function (err, res) {
      connection.release();
        if (err) {
          console.dir(err);
        } else {
          callback(err);
        }
      });
    }
  });
};

admin.getPartyFullInfoMemberByName = function (name, callback) {
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      console.dir(err);
    } else {
      var query = "SELECT p.*, u.foto, r.party_name, r.leader, r.gold, r.admin_id, r.navi_id"
        + " FROM player p"
        + " LEFT JOIN user u ON p.id=u.id"
        + " LEFT JOIN party r ON p.party_id=r.id"
        + " WHERE r.party_name='" + name + "'";
      console.log(query);

      connection.query(query, function (err, rows) {
        connection.release();
        if (err) {
          console.dir(err);
        } else {
          callback(rows);
        }
      });
    }
  });
};

admin.getPartyListByGuild = function (id, callback) {
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      console.dir(err);
    } else {
      var query = "SELECT p.id, p.name"
        + " FROM party p"
        + " WHERE p.guild_id=" + id;
      console.log(query);

      connection.query(query, function (err, rows) {
        connection.release();
        if (err) {
          console.dir(err);
        } else {
          callback(rows);
        }
      });
    }
  });
};

admin.getFullPlayerData = function (g_id, callback) {
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      console.dir(err);
    } else {
      var query = "SELECT md5(nickname) mdnick, u.nim_tpb, u.jurusan, u.foto, fullname, nickname, job, job_level, job_exp, infection_level, aegis_gauge"
        + " FROM player p LEFT JOIN user u ON p.id = u.id"
        + " WHERE p.guild_id=" + g_id
        + " ORDER BY u.nim_tpb ASC";
      console.log(query);

      connection.query(query, function (err, rows) {
        connection.release();
        if (err) {
          console.dir(err);
        } else {
          callback(rows);
        }
      });
    }
  });
};

admin.getPlayersWorstInfection = function (limit, g_id, callback) {
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      console.dir(err);
    } else {
      var query = "SELECT u.nim_tpb, u.jurusan, u.foto, fullname, nickname, job, job_level, job_exp, infection_level, aegis_gauge"
        + " FROM player p LEFT JOIN user u ON p.id = u.id"
        + " WHERE p.guild_id=" + g_id
        + " ORDER BY infection_level DESC"
        + " LIMIT " + limit;
      console.log(query);

      connection.query(query, function (err, rows) {
        connection.release();
        if (err) {
          console.dir(err);
        } else {
          callback(rows);
        }
      });
    }
  });
};

admin.getPlayersBestAegis = function (limit, g_id, callback) {
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      console.dir(err);
    } else {
      var query = "SELECT u.nim_tpb, u.jurusan, u.foto, fullname, nickname, job, job_level, job_exp, infection_level, aegis_gauge"
        + " FROM player p LEFT JOIN user u ON p.id = u.id"
        + " WHERE p.guild_id=" + g_id
        + " ORDER BY aegis_gauge DESC"
        + " LIMIT " + limit;
      console.log(query);

      connection.query(query, function (err, rows) {
        connection.release();
        if (err) {
          console.dir(err);
        } else {
          callback(rows);
        }
      });
    }
  });
};

module.exports = admin;