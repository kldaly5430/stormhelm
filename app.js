var createError = require('http-errors');
var express = require('express');
const helmet = require('helmet');
var ejs = require('ejs');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressValidator = require('express-validator');
var session = require('express-session');
var flash = require('express-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcrypt');

require('dotenv').config();

const connection = require('./db/db');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var charactersRouter = require('./routes/characters');
var spellsRouter = require('./routes/spells');
var classRouter = require('./routes/class');
var npcRouter = require('./routes/npc');
var recapRouter = require('./routes/recap');
var equipmentRouter = require('./routes/equipment');


var app = express();

app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var options = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

var sessionStore = new MySQLStore(options);

app.use(session({
  secret: process.env.SSN_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  //cookie: { maxAge: 60000 }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


app.use(expressValidator({
  customValidators: {
    isValidDate: function(value){
      if(!value.match(/^\d{2}-\d{2}-\d{4}$/))
        return false;
    }
  }
}));

app.use(function(req, res, next){
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/characters', charactersRouter);
app.use('/spells', spellsRouter);
app.use('/npc', npcRouter);
app.use('/class', classRouter);
app.use('/recap', recapRouter);
app.use('/equipment', equipmentRouter);

passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log(username);
    console.log(password);
    const db = require('./db/db');

    db.query('SELECT id, password FROM users WHERE userName = ?', [username], function(err, results, fields){
      if(err){done(err)};

      if(results.length === 0){
        done(null, false);
      } else {

        const hash = results[0].password.toString();

        bcrypt.compare(password, hash, function(err, response){
          if(response === true){
            return done(null, {user_id: results[0].id});
          } else {
            return done(null, false);
          }
        });
      }
    })
  }
));

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
