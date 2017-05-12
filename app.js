var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
//var multer  = require('multer');

var index = require('./routes/index');
var users = require('./routes/users');
var sudrf = require('./routes/sud/sudrf');
var parts = require('./routes/parts');
//var test  = require('./routes/test1');
var a_travel  = require('./routes/disc/travel');
var a_motor  = require('./routes/disc/motor');
var a_fs  = require('./routes/disc/disc_fs');
var a_shablon = require('./routes/docxtempl/docx_tmpl');

var telematika  = require('./routes/telematika/telematika');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
app.use(logger('combined', {stream: accessLogStream}))
//app.use(logger('dev'));
//app.use(bodyParser);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/uploads')));


app.use('/', index);
app.use('/users', users);
app.use('/data/v1/sudrf',sudrf);
app.use('/data/v1/parts',parts);
//app.use('/test',test);
app.use('/atlantis/travel',a_travel);
app.use('/atlantis/motor',a_motor);
app.use('/atlantis/v1/fs',a_fs);
app.use('/atlantis/v1/template', a_shablon);
app.use('/atlantis/v1/telematika', telematika);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
