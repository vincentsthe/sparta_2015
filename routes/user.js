var express = require('express');
var router = express.Router();
var player = require('../model/player');

/* GET users listing. */
router.get('/home', function(req, res, next) {
  player.getPlayerDashboardInfoById(req.user.id, function (userInfo) {
    res.render('home', {
      user_info: userInfo
    });
  });

});

router.get('/logout', function (req, res, next) {
  req.logout();
  res.redirect('/');
});

function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
}

module.exports = router;
