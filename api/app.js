var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const exphbs = require('express-handlebars');
var indexRouter = require('../routes/index');
var adminRouter = require('../routes/admin');
var hbs = require('hbs')
var app = express();
const session = require('express-session')
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

var db = require('../config/connection')

db.connect(function(err){
  if(err) return console.log('database could be connected ',err)
  console.log('db connnect successfully')
})
// view engine setup
app.engine('hbs', exphbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(session({secret:'secretKey',resave:false,saveUninitialized:false,cookie:{
  maxAge:1000*60*60,secure:false
}}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
