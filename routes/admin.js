var express = require('express');
var router = express.Router();
var md5 = require('MD5');
var fs = require('fs');
var path = require('path');

var driver = require('../utility/driver');
var adminModel = require('../model/admin');
var playerModel = require('../model/player');

router.get('/guild/:guild/:name', isLoggedIn, function (req, res) {
  var name = (req.params.name).toUpperCase();
  var data = [];
  var party = [];  
  
  adminModel.getPartyFullInfoMemberByName(name, function (row) {
    for (var i = 0; i < row.length; i++) {
      var record = {};
      record.id = row[i].id;
      record.fullname = row[i].fullname;
      record.nickname = row[i].nickname;
      record.job = row[i].job;
      record.level = row[i].job_level;
      record.exp = row[i].job_exp;
      record.infection = row[i].infection_level;
      record.aegis = row[i].aegis_gauge;
      record.foto = row[i].foto;

      data.push(record);
    }

    party.leader = row[0].leader;
    party.gold = row[0].gold;

    playerModel.getPlayerBasicInfoById(row[0].admin_id, function (adminInfo) {
      playerModel.getPlayerBasicInfoById(row[0].navi_id, function (naviInfo) {
        res.render('party', {
          party_list: data,
          party_data: party,
          admin_data: adminInfo,
          navi_data: naviInfo
        });
      });
    });
  });

});

router.post('/guild/:guild/:name', isLoggedIn, function (req, res) {
  var name = (req.params.name).toUpperCase();
  var postData = req.body;

  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      console.dir(err);
      res.send("Error connecting to database");
    } else {
      var query = "SELECT p.id"
        + " FROM player p"
        + " LEFT JOIN party r ON p.party_id=r.id"
        + " WHERE r.party_name='" + name + "'";

      connection.query(query, function (err, row) {
        connection.release();        
        if (err) {
          console.dir(err);
        } else {
          for (var i = 0; i < row.length; i++) {
            var player = {};
            player.job_exp = postData['exp_' + row[i].id];
            player.infection_level = postData['infection_' + row[i].id];
            player.aegis_gauge = postData['aegis_' + row[i].id];

            playerModel.update(row[i].id, player, function (err, result) {
              if (err) {
                console.dir(err);
                res.send("Gagal memasukkan data, harap isi form kembali");
              }
            });

            //record.id = row[i].id;
          }

          res.redirect('/party/' + name.toLowerCase(), 301);
        }
      });
    }
  });
});

function ISODateString(d){
  function pad(n){return n<10 ? '0'+n : n}
  return d.getUTCFullYear()+'-'
      + pad(d.getUTCMonth()+1)+'-'
      + pad(d.getUTCDate()) +' '
      + pad(d.getUTCHours())+':'
      + pad(d.getUTCMinutes())+':'
      + pad(d.getUTCSeconds())
}

Date.prototype.addHours = function(h) {    
   this.setTime(this.getTime() + (h*60*60*1000)); 
   return this;   
}

/* Adding Quest */
router.get('/quest', isAdmin, function (req, res) {
  res.render('quest_add');
});

router.post('/quest', isAdmin, function (req, res) {
  var postData = req.body;

  var quest = {};
  quest.name = postData.name;
  quest.description = postData.description;

  var start_date = new Date(postData.start_date + " " + postData.start_hour + ":" + postData.start_min);
  quest.start_date = ISODateString(start_date.addHours(7));

  var end_date = new Date(postData.end_date + " " + postData.end_hour + ":" + postData.end_min);
  quest.end_date = ISODateString(end_date.addHours(7));
  
  quest.exp = postData.exp;

  adminModel.addQuest(quest, function (err, result) {
    if (err) {
      console.dir(err);
      res.send("Gagal memasukkan data, harap isi form kembali");
    } else {
      res.send("Berhasil!");
    }
  });
});

router.get('/guild/:guild/:name/quest', isAdmin, function (req, res) {
  var name = (req.params.name).toUpperCase();
  //var id = req.params.id;
  var data = [];

  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      console.dir(err);
      res.send("Error connecting to database");
    } else {

      var query = "SELECT * FROM ("
                  + " SELECT * FROM ("
                      + " SELECT player_id, file, time, quest_id"
                      + " FROM quest_submitted"
                      + " ORDER BY time DESC"
                  + " ) as t1"
                  + " GROUP BY player_id, quest_id "
                  + " ) as u"
                  + " LEFT JOIN player p ON u.player_id = p.id"
                  + " LEFT JOIN party r ON p.party_id = r.id"
                  + " WHERE r.party_name='" + name + "'"
                  + " ORDER BY u.quest_id ASC";

      connection.query(query, function (err, row) {
        connection.release();        
        if (err) {
          console.dir(err);
        } else {
          var cur_quest = 0;

          var q = {};
              q.submitter = [];

          for (var i = 0; i < row.length; i++) {
            if ( cur_quest != row[i].quest_id ) {
              q.id = cur_quest;
              data.push(q);

              q = {};
              q.submitter = [];

              cur_quest = row[i].quest_id;
            }

            var record = {};
            record.id = row[i].id;
            record.fullname = row[i].fullname;
            record.file = row[i].file;
            record.time = row[i].time;
            record.quest_id = row[i].quest_id;

            q.submitter.push(record);

          }
          q.id = cur_quest
          data.push(q);

          playerModel.getAllQuestDetail(0, function (questList) {
            if (typeof questList === "undefined") { 
              res.send("Error fetching Quest Details!");  
            } else {
              res.render('party_quest', {
                party_list: data,
                quest_data: questList
              });              
            }
          });
        }
      });

    }
  });
});

/* Adding News. */
router.get('/add_news', isAdmin, function (req, res) {
  res.render('news_add');
});

router.post('/add_news', isAdmin, function (req, res) {
  var postData = req.body;

  var news = {};
  news.title = postData.title;
  news.sub_title = postData.sub_title;
  news.overview = postData.overview;
  news.content = postData.content;

  var images = req.files.picture;
  var fileName = news.title;

  if (images.mimetype == "image/png" || images.mimetype == "image/jpg" || images.mimetype == "image/jpeg") {
    fileName += path.extname(images.name);
    news.poster = fileName;

    adminModel.addNews(news, function (err, result) {
      if (err) {
        console.dir(err);
        res.send("Gagal memasukkan data, harap isi form kembali");
      } else {

          fs.rename(req.files.picture.path, 'public/images/' + fileName, function (err) {
            if (err) throw err;
            fs.stat('public/images/' + fileName, function (err, stats) {
              if (err) throw err;
              res.send("Berhasil!");
            });
          });

/*        fs.readFile(req.files.picture.path, function (err, data) {
          var path = __dirname + "../public/images/" + fileName;
          fs.writeFile(path, data, function (err) {
            res.send("Berhasil!");
          });
        });  */  

      }
    });
  } else {
    res.send("photo is not a valid image");
  }
});

router.get('/quest/delete/:id', isAdmin, function (req, res) {
  var id = req.params.id;
  console.log("adwadaw");
  adminModel.deleteQuest(id, function (err, result) {
    if (err) {
      console.dir(err);
      res.send("Gagal memasukkan data, harap isi form kembali");
    } else {
      res.send("Berhasil menghapus Quest");
    }
  });
});

/* DETAILED INFOS */

/* THE CODE BELOW IS SO EMBARASSING, YEA I KNOW.... FORGIVE ME :( */
router.get('/guild/:name', function (req, res) {
  var name = (req.params.name).toLowerCase();
      name = name.charAt(0).toUpperCase() + name.slice(1);
  var data = [];  

  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      console.dir(err);
      res.send("Error connecting to database");
    } else {

      var query = "SELECT * " +
        " FROM guild g" +
        " RIGHT JOIN party ON party.guild_id = g.id " +
        " WHERE g.nama = '" + name + "'";

      connection.query(query, function (err, row) {
        connection.release();
        if (err) {
          console.dir(err);
        } else {
          var inserted = 0;
          for (var i = 0; i < row.length; i++) {

            adminModel.getPartyFullInfoMemberByName(row[i].party_name, function (newrow) {
              playerModel.getPlayerBasicInfoById(newrow[0].admin_id, function (adminInfo) {
                playerModel.getPlayerBasicInfoById(newrow[0].navi_id, function (naviInfo) {
                  
                    var p = {};
                    p.party_name = newrow[0].party_name;
                    p.member = [];

                    for (var j = 0; j < newrow.length; j++) {
                      var record = {};
                      record.id = newrow[j].id;
                      record.fullname = newrow[j].fullname;
                      record.nickname = newrow[j].nickname;
                      record.job = newrow[j].job;
                      record.level = newrow[j].job_level;
                      record.exp = newrow[j].job_exp;
                      record.infection = newrow[j].infection_level;
                      record.aegis = newrow[j].aegis_gauge;
                      record.foto = newrow[j].foto;

                      p.member.push(record);
                    }

                    p.leader = newrow[0].leader;
                    p.gold = newrow[0].gold;

                    p.adminFullname = adminInfo.fullname;
                    p.adminNickname = adminInfo.nickname;
                    p.adminFoto = adminInfo.foto;

                    p.naviFullname = naviInfo.fullname;
                    p.naviNickname = naviInfo.nickname;
                    p.naviFoto = naviInfo.foto;

                    data.push(p);

                    //console.log("i = " + data.length);
                    if ( data.length >= row.length ) {
                      res.render('users', {
                        user_list: data
                      });
                    }


                });
              });
            });
          }
        }
      });

    }
  });
 
});

router.get('/profile/:nim', isOnlyPermittedToView, function(req, res, next) {
  var nim = req.params.nim;
  playerModel.getPlayerDetailedInfoByNIM(nim, function (userInfo) {
    var empty = [];

    res.render('home', {
      user_info: userInfo,
      quest_list: empty
    });

  });

});

router.get('/profile/:nim/details', isOnlyPermittedToView, function(req, res, next) {
  var nim = req.params.nim;
  playerModel.getPlayerDetailedInfoByNIM(nim, function (userInfo) {

    res.render('home_detailed', {
      user_info: userInfo
    });

  });

});

router.get('/my_quest', function (req, res) {
  res.redirect('/profile/' + req.user.nim_tpb + '/quest');
});

/* GET quest listing. */
router.get('/profile/:nim/quest', isLoggedIn, function(req, res, next) {
  var nim = req.params.nim;

  if ( ( req.user.access <= 1 ) && (nim != req.user.nim_tpb) ) {
    console.log('(!) ' + req.user.nickname + ' is trying to access ' + nim + ' quest page');
    res.redirect('/');
  } else {
    playerModel.getQuestList(0, req.user.access, function (questList) {
      playerModel.getQuestStatus(0, nim, function (questStatus) {

        res.render('quest_list', {
          quest_list: questList,
          quest_status: questStatus
        });

      });
    });
  }

});

router.get('/dashboard', isOnlyPermittedToView, function(req, res, next) {

  adminModel.getFullPlayerData(1, function (playerInfo) {
    adminModel.getPlayersWorstInfection(15, 1, function (topInfection) {
      adminModel.getPlayersBestAegis(10, 1, function (topAegis) {
        res.render('dashboard', {
          player_info: playerInfo,
          top_aeg: topAegis,
          top_inf: topInfection
        });

      });
    });
  });

});

router.get('/quiz', function(req, res, next) {

  adminModel.getFullPlayerData(1, function (playerInfo) {
    res.render('quiz', {
      user_list: playerInfo
    });
  });

});


function isAdmin (req, res, next) {
  if (req.isAuthenticated() && req.user.access >= 4) {
    return next();
  }

  var name = "Someone";

  if ( typeof req.user !== "undefined" ) {
    name = req.user.nickname;
  }

  console.log('(!) ' + name + ' is trying to access administrator page');
  res.redirect('/');
}

function isOnlyPermittedToView (req, res, next) {
  if (req.isAuthenticated() && req.user.access >= 3) {
    return next();
  }
  res.redirect('/');
}

function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
}

module.exports = router;
