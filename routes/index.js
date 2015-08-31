var express = require('express');
var router = express.Router();
var md5 = require('MD5');
var fs = require('fs');
var path = require('path');
var flash = require('connect-flash');

var driver = require('../utility/driver');
var userModel = require('../model/user');
var playerModel = require('../model/player');

module.exports = function (passport) {
  /* GET home page. */
  router.get('/', function (req, res, next) {
    res.render('index', {message: req.flash('error')});
  });

  router.post('/', passport.authenticate('login', {
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true
  }), function (req, res, next) {
    res.send('login attempt');
    console.log('login attempt');
  });

  router.get('/news', function (req, res) {
    res.render('news');
  });
  router.get('/guide', function (req, res) {
    res.render('guide');
  });
  router.get('/about', function (req, res) {
    res.render('about');
  });
  router.get('/story', function (req, res) {
    res.render('story');
  });

/*  router.get('/register', function (req, res) {
    res.render('register');
  });

  router.post('/register', function (req, res) {
    var postData = req.body;


    var user = {};
    user.email = postData.email;
    user.password = md5(postData.password);
    user.nim_tpb = postData.nim_tpb;
    user.jurusan = postData.jurusan;
    user.nomor_telepon = postData.nomor_telepon;
    user.id_twitter = postData.id_twitter;
    user.id_facebook = postData.id_facebook;
    user.id_line = postData.id_line;
    user.alamat_bandung = postData.alamat_bandung;
    user.golongan_darah = postData.golongan_darah;
    user.riwayat_penyakit = postData.riwayat_penyakit;
    user.mbti = postData.mbti;
    user.tempat_lahir = postData.tempat_lahir;
    user.tanggal_lahir = postData.tanggal_lahir;
    user.asal_daerah = postData.asal_daerah;
    user.asal_sma = postData.asal_sma;
    user.alamat_rumah = postData.alamat_rumah;
    user.nama_wali = postData.nama_wali;
    user.kontak_wali = postData.kontak_wali;

    var player = {};
    player.fullname = postData.nama_lengkap;
    player.nickname = postData.nama_panggilan;
    player.job = "";
    player.job_level = 0;
    player.infection_level = 0;
    player.aegis_gauge = 0;

    var images = req.files.foto;
    var fileName = user.nim_tpb;
    if (images.mimetype == "image/png" || images.mimetype == "image/jpg" || images.mimetype == "image/jpeg") {
      fileName += path.extname(images.name);
      user.foto = fileName;

      userModel.insert(user, function (err, result) {
        if (err) {
          console.dir(err);
          res.send("Gagal memasukkan data, harap isi form kembali");
        } else {
          player.id = result;
          playerModel.insert(player, function (err, result) {
            if (err) {
              console.dir(err);
              res.send("Gagal memasukkan data, harap isi form kembali");
            } else {
              fs.readFile(req.files.foto.path, function (err, data) {
                var path = __dirname + "../public/images/" + fileName;
                fs.writeFile(path, data, function (err) {
                  res.send("Terimakasih telah mengisi data SPARTA 2015");
                });
              });
            }
          });
        }
      });
    } else {
      res.send("photo is not a valid image");
    }
  }); */

  router.get('/members', function (req, res) {
  /*  var data = [];
    driver.mysqlpool.getConnection(function (err, connection) {
      if (err) {
        console.dir(err);
      } else {

        var query = "SELECT u.id, u.email, u.nim_tpb, u.jurusan, u.foto, p.fullname, p.nickname, p.party_id, party.party_name" +
          " FROM user u" +
          " INNER JOIN player p ON u.id = p.id" +
          " INNER JOIN party ON p.party_id = party.id " +
          " WHERE p.guild_id = 1" +
          " ORDER BY u.nim_tpb ASC";
        connection.query(query, function (err, row) {
          connection.release();
          if (err) {
            console.dir(err);
          } else {
            for (var i = 0; i < row.length; i++) {
              var record = {};
              record.id = row[i].id;
              record.nim_tpb = row[i].nim_tpb;
              record.foto = row[i].foto;
              record.fullname = row[i].fullname;
              record.nickname = row[i].nickname;
              record.party_id = row[i].party_id;
              record.party_name = row[i].party_name;

              data.push(record);
            }

            res.render('user_list', {
              user_list: data
            });
          }
        });
      }
    });*/
    res.redirect('/guild/syntax');
  });

  router.get('/detail/:id', function (req, res) {
    var id = req.params.id;

    driver.mysqlpool.getConnection(function (err, connection) {
      if (err) {
        console.dir(err);
        res.send("Error connecting to database");
      } else {
        var query = "SELECT u.*, p.*"
          + " FROM user u"
          + " INNER JOIN player p ON u.id=p.id"
          + " WHERE u.id=" + id;

        connection.query(query, function (err, rows) {
          connection.release();
          if (err) {
            res.send("Id is not valid");
          } else {
            if (!rows[0]) {
              res.send("User with id " + id + " is not found");
            } else {
              res.json(rows[0]);
            }
          }
        });
      }
    });
  });
  
/*Abaikan by: feryandi*/
  router.get('/news', function (req, res) {
    var data = [];
    driver.mysqlpool.getConnection(function (err, connection) {
      if (err) {
        console.dir(err);
      } else {

        var query = "SELECT n.id, n.title, n.sub_title, n.overview, n.content"
          + " FROM news n";
        connection.query(query, function (err, row) {
          if (err) {
            console.dir(err);
          } else {
            var x = ( row.length > 4 ) ? 4 : row.length;
            for (var i = 0; i < x; i++) {
              var record = {};
              record.id = row[i].id;
              record.title = row[i].title;
              record.sub_title = row[i].sub_title;
              record.overview = row[i].overview;
              record.content = row[i].content;

              data.push(record);
            }

            res.render('news', {
              news_list: data
            });
          }
        });
      }
    });
  });

  return router;
};
