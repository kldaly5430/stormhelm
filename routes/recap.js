var express = require('express');
var router = express.Router();
var connection = require('../db/db');

//Recap index page
router.get('/', function(req, res, next){
    connection.query('SELECT * FROM recap ORDER BY id', function(err, results){
        if(err){
            req.flash('error', err);
            res.render('recap/index', {title: 'Recap', data:''});
        } else {
            res.render('recap/index', {title:'Recap', data: results});
        }
    });
});

//Recap add new recap page
router.get('/add', authenticationMiddleware(), function(req, res, next){
    res.render('recap/addRecap');
})

router.post('/add', authenticationMiddleware(), function(req, res, next){
    req.assert('date', 'Date must have a valid format (MM/DD/YYYY').notEmpty(),
    req.assert('title', 'Title is require').notEmpty(),
    req.assert('recap', 'Please enter a recap or why else are you writing this?').notEmpty()

    var errors = req.validationErrors();

    if(!errors){
        var sessionRecap = {
            date: req.sanitize('date').escape().trim(),
            title: req.sanitize('title').escape().trim(),
            recap: req.sanitize('recap').escape().trim() //.whitelist(/^[A-Za-z0-9\/\s\.'\-]+$/)
        }

        connection.query('INSERT INTO recap SET ?', sessionRecap, function(err, result){
            if(err){
                req.flash('error', err);
                req.render('recap/addRecap', {date: sessionRecap.date, title: sessionRecap.title, recap: sessionRecap.recap});
            } else {
                req.flash('success', 'Recap added!');
                res.redirect('/recap');
            }
        });
    } else {
        var error_msg = '';
        Object.keys(errors).forEach(function(error){
            error_msg += error_msg + '<br>'
        });
        req.flash('error', error_msg);
        res.render('recap/addRecap', {date: req.body.date, title: req.body.title, recap: req.body.recap});
    }
});

router.get('/recap/:id', function(req, res, next){
    console.log(id);
    connection.query('SELECT * FROM recap WHERE id = ' + req.params.id, function(err, rows, fields){
        console.log(rows);
        if(err) throw err;
        // var data = [];
        // for(i = 0; i < rows.length; i++){
        //     data.push(rows[i]);
        // }
        res.send("/recap", {data: rows});
    });
});

// Logged in authentication
function authenticationMiddleware(){
    return function(req, res, next){
      
      if(req.isAuthenticated()) return next(
      );
      res.redirect('/login');
    }
  }

module.exports = router;