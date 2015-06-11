var express = require('express');
var router = express.Router();
var md5 = require('MD5');
var fs = require('fs');
var path = require('path');

var driver = require('../utility/driver');
var userModel = require('../model/user');
var playerModel = require('../model/player');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/register', function (req, res) {
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

  var images = req.files.foto;
  var fileName = user.nim_tpb;
  if (images.mimetype=="image/png" || images.mimetype=="image/jpg" || images.mimetype=="image/jpeg") {
    fileName+= path.extname(images.name);
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
});

router.get('/yang_udah_daftar', function (req, res) {
  var data = [];
  driver.mysqlpool.getConnection(function (err, connection) {
    if (err) {
      console.dir(err);
    } else {

      var query = "SELECT u.id, u.email, u.nim_tpb, u.nim_jurusan, p.fullname"
        + " FROM user u"
        + " INNER JOIN player p ON u.id=p.id";
      connection.query(query, function (err, row) {
        if (err) {
          console.dir(err);
        } else {
          for (var i = 0; i < row.length; i++) {
            var record = {};
            record.id = row[i].id;
            record.email = row[i].email;
            record.nim_tpb = row[i].nim_tpb;
            record.jurusan = row[i].jurusan;
            record.fullname = row[i].fullname;

            data.push(record);
          }

          res.render('user_list', {
            user_list: data
          });
        }
      });
    }
  });
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

module.exports = router;
