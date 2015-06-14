var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/home', isLoggedIn, function(req, res, next) {
  res.send('Logged in!');
});

function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
}

module.exports = router;
