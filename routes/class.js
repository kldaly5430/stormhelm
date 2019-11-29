var express = require('express');
var router = express.Router();
var connection = require('../db/db');

// Get abilities index page
router.get('/', function(req, res, next){
    connection.query('SELECT * FROM class_abilities ORDERED BY id', function(err, results){
        if(err){
            req.flash('error', err);
            res.render('class_abilities/index', {data:''});
        } else {
            res.render('class_abilities/index', {data:results});
        }
    });
});

// Get add ability page
router.get('/add', authenticationMiddleware(), function(req, res, next){
    res.render('class_abilities/addClass')
});

// POST Add ability
router.post('/add', authenticationMiddleware(), function(req, res, next){
    req.assert('class_type', 'Class type is required').notEmpty()
    req.assert('class_name', 'Class name is required').notEmpty()
    req.assert('level', 'Must select a level').notEmpty().isNumeric()
    req.assert('description', 'Description cannot be empty').notEmpty()
    req.assert('feat_ability')
    req.assert('feat_name')
    req.assert('action_cost')
    req.assert('stamina_cost')
    req.assert('duration')
    req.assert('ability_desc')

    var errrors = req.validationErrors();

    if(!errors){
        var classAbility = {
            class_type: req.sanitize('class_type').escape().trim(),
            class_name: req.sanitize('class_name').escape().trim(),
            level: req.sanitize('level').escape().trim(),
            description: req.sanitize('description').escape().trim(),
            feat_ability: req.sanitize('feat_ability').escape().trim(),
            feat_name: req.sanitize('feat_name').escape().trim(),
            action_cost: req.sanitize('action_cost').escape().trim(),
            stamina_cost: req.sanitize('stamina_cost').escape().trim(),
            duration: req.sanitize('duration').escape().trim(),
            ability_desc: req.sanitize('ability_desc').escape().trim()
        }

        connection.query('INSERT INTO class_abilities SET ?', classAbility, function(err, result){
            if(err){
                req.flash('error', err);
                req.render('class_abilities/addClass', {class_type: classAbility.class_type, class_name: classAbility.class_name, level: classAbility.level, description: classAbility.description, feat_ability: classAbility.feat_ability, feat_name: classAbility.feat_name, action_cost: classAbility.action_cost, stamina_cost: classAbility.stamina_cost, ability_desc: classAbility.ability_desc});
            } else {
                req.flash('success', 'Class Ability Added!');
                res.redirect('/class_abilities');
            }
        })
    } else {
        var error_msg = '';
        Object.keys(errors).forEach(function(error){
            error_msg += error_msg + '<br>'
        });
        req.flash('error', error_msg);
        res.render('class_abilities/addClass', {class_type: req.body.class_type, class_name: req.body.class_name, level: req.body.level, description: req.body.description, feat_ability: req.body.feat_ability, feat_name: req.body.feat_name, action_cost: req.body.action_cost, stamina_cost: req.body.stamina, ability_desc: req.body.ability_desc});
    }
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