var login = require('./login');
var driver = require('../utility/driver');

module.exports = function(passport){

	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		driver.mysqlpool.getConnection(function (err, connection) {
      connection.query("select * from user NATURAL JOIN player where id=" + id,function (err, rows){
          connection.release();
        done(err, rows[0]);
      });
    });
	});

	// Setting up Passport Strategies for Login and SignUp/Registration
	login(passport);

}