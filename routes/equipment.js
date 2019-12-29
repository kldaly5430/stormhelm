var express = require('express');
var router = express.Router();
var connection = require('../db/db');

router.get('/', function(req, res, next){
    connection.query('SELECT * FROM equipment ORDER BY id', function(err, results){
      if(err){
        req.flash('error', err);
        res.render('equipment/equipmentList', {title: 'Equipment', data: ''});
      } else {
        res.render('equipment/equipmentList', {title: 'Equipment', data: results})
      }
    })
});

function authenticationMiddleware(){
    return function(req, res, next){
      
      if(req.isAuthenticated()) return next(
      );
      req.flash('error', 'You need to be signed to complete this action!');
      res.redirect('/spells');
    }
  }

module.exports = router;