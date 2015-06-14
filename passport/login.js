var LocalStrategy   = require('passport-local').Strategy;
var md5 = require('MD5');

var driver = require('../utility/driver');

module.exports = function(passport){

  passport.use('login', new LocalStrategy({
			passReqToCallback : true,
				usernameField: 'email',
        passwordField: 'password'
		},
		function(req, email, password, done) {
      driver.mysqlpool.getConnection(function (err, connection) {
        connection.query("SELECT * FROM `user` WHERE `email`='" + email + "'", function (err, rows) {
          if (err)
            return done(err);
          if (!rows.length) {
            return done(null, false, req.flash('loginMessage', 'Email tidak terdaftar.'));
          }

          // if the user is found but the password is wrong
          if (!( rows[0].password == md5(password)))
            return done(null, false, req.flash('loginMessage', 'Password salah!.'));

          // all is well, return successful user
          return done(null, rows[0]);

        });
      });
		})
	);
};