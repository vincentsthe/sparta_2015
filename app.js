var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');

var app = express();

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');
var FileStore = require('session-file-store')(expressSession);

app.use(expressSession({
  store: new FileStore,
  secret: "Sparta20!5",
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

var flash = require('connect-flash');
app.use(flash());

app.use(function(req, res, next) {
  res.locals.login = req.isAuthenticated();
  res.locals.admin = false;
  if (req.isAuthenticated()) {
    res.locals.admin = (req.user.access >= 4);
    res.locals.canView = (req.user.access >= 3);
  }
  next();
});


var initPassport = require('./passport/init');
initPassport(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({dest:'./public/images/'}));
app.use(multer({dest:'./public/uploads/'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var routes = require('./routes/index')(passport);
var userRoutes = require('./routes/user');

/*Abaikan by: feryandi*/
var adminRoutes = require('./routes/admin');
app.use('/', adminRoutes);
/* ****************** */

app.use('/', routes);
app.use('/', userRoutes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
