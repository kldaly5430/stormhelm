var express = require('express');
var router = express.Router();
var connection = require('../db/db');
const passport = require('passport');
const bcrypt = require('bcrypt');
const saltRounds = 10;

//Home page promise
const queryWrapper = function(statement){
  return new Promise(function(resolve, reject){
    connection.query(statement, function(err, result){
      if(err)
        return reject(err);
      resolve(result);
    });
  });
};

/* GET home page. */
router.get('/', function(req, res, next) {
  // console.log(req.user);
  // console.log(req.isAuthenticated());
  Promise.all([
    queryWrapper('SELECT * FROM recap ORDER BY id'),
    queryWrapper('SELECT * FROM npc ORDER BY id')
  ])
  .then(function([recaps, npcs]){
    res.render('index', {
      recaps,
      npcs
    });
  })
  .catch(err => {
    console.error(err);
    res.redirect('/characters');
  })
});

// Register page
router.get('/register', function(req, res, next){
  res.render('users/register')
});

// Register users
router.post('/register', function(req, res, next){
  req.checkBody('name', 'Name field cannot be empty').notEmpty();
  req.checkBody('userName', 'Username must between 3 and 15 characters long').len(3,15);
  req.checkBody('password', 'Password must be at least 8 characters long').len(8,100);
  req.checkBody('password', 'Pass must contain at least one capital letter, one numerical character, one symbol').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i"); //check password for upper case, number and special character for added security
  req.checkBody('password2', 'Passwords do not match, please try again').equals(req.body.password);
  req.checkBody('password2', 'Password must be at least 8 characters long').len(8,100); // check for length
  
  const errors = req.validationErrors();

  if(errors.length > 0){
    res.render('users/register', {
      errors: errors
    });
    console.log(errors);
  } else {
        const name = req.body.name;
        const userName = req.body.userName;
        const password = req.body.password;

        const connection = require('../db/db');

        bcrypt.hash(password, saltRounds, function(err, hash) {
          connection.query('INSERT INTO users (name, userName, password) VALUES (?,?,?)', [name, userName, hash], function(error, results, fields){
            if(error) throw error;
            
            connection.query('SELECT LAST_INSERT_ID() as user_id', function(error, results, fields){
              if(error) throw error;

              const user_id = results[0];

              req.login(user_id, function(err){
                console.log(user_id);
                res.redirect('/');
              });
            });
          })
        });
      }
});

// Login page
router.get('/login', function(req, res, next) {
  res.render('users/login', {title: 'Login'})
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

// Logout
router.get('/logout', function(req, res, next){
  req.logout();
  req.session.destroy();
  res.redirect('/');
})

passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
  done(null, user_id);
});

function authenticationMiddleware(){
  return function(req, res, next){
    
    if(req.isAuthenticated()) return next(
    );
    res.redirect('/login');
  }
}

module.exports = router;
