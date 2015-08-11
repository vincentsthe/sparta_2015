var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

var player = require('../model/player');
var user = require('../model/user');
var driver = require('../utility/driver');

/* GET users listing. */
router.get('/profile', isLoggedIn, function(req, res, next) {
  player.getPlayerDashboardInfoById(req.user.id, function (userInfo) {

      res.render('home', {
        user_info: userInfo,
      });

  });

});


router.get('/logout', function(req, res){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
  // destroy the user's session to log them out                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
  // will be re-created next request                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
  req.session.destroy(function(){   
    req.logout();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
    res.redirect('/');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
  });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
}); 

function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
}


/* Upload Quest */
router.get('/quest/:id', isLoggedIn, function (req, res) {
  var id = req.params.id;

  player.getQuestStatus(id, 0, function (questStatus) {
    player.getQuestList(id, req.user.access, function (questList) {

      if (typeof questList === "undefined") {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
        res.redirect('/');   
      } else {
        var uploaded = false;
        questStatus.forEach(function(status) {
          if (status.player_id == req.user.id) {
            uploaded = true;
          }
        });

        questList.uploaded = uploaded;
        questList.submitted = questStatus.length;
        res.render('quest_upload', {
          quest: questList
        });
      }

    });
  });
});

router.post('/quest/:id', isLoggedIn, function (req, res) {
  var id = req.params.id;
  var quest = {};

  quest.quest_id = id;
  quest.player_id = req.user.id;

  var file = req.files.tugas;
  var fileName = req.files.tugas.originalname;
  console.log(req.files.tugas);

  if ( ( file.mimetype == "image/png" || 
         file.mimetype == "image/jpg" || 
         file.mimetype == "image/jpeg" || 
         file.mimetype == "application/msword" || 
         file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
         file.mimetype == "application/pdf" || 
         file.mimetype == "application/zip, application/octet-stream" )
        && file.size <= 5000000 ) {

    quest.file = id + "_" + req.user.id + "_" + fileName;
    fileName = quest.file;

    player.uploadQuest(quest, function (err, result) {
      if (err) {
        console.dir(err);
        res.send("Gagal memasukkan data, harap upload ulang");
      } else {
        fs.rename(req.files.tugas.path, 'public/uploads/' + fileName, function (err) {
          if (err) throw err;
          fs.stat('public/uploads/' + fileName, function (err, stats) {
            if (err) throw err;
            res.send("Berhasil!");
          });
        });
      }
    });

  } else {
    res.send("File is not valid. Pastikan ukuran kurang dari 5MB dan tipe file tepat.");
  }
});

/* USER EDITOR */
router.get('/edit/avatar', isLoggedIn, function (req, res) {
  res.render('avatar');
});

router.post('/edit/avatar', isLoggedIn, function (req, res) {
  var images = req.files.picture;
  var fileName = req.user.nim_tpb;

  if (images.mimetype == "image/png" || images.mimetype == "image/jpg" || images.mimetype == "image/jpeg") {
    fileName += path.extname(images.name);

    fs.rename(req.files.picture.path, 'public/images/' + fileName, function (err) {
      if (err) throw err;
      fs.stat('public/images/' + fileName, function (err, stats) {
        if (err) throw err;
        res.send("Berhasil!");
      });
    });

  } else {
    res.send("photo is not a valid image");
  }
}); 

module.exports = router;
