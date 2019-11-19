var express = require('express');
var router = express.Router();
var connection = require('../db/db');

// Get NPCs index
router.get('/', function(req, res, next){
    connection.query('SELECT * FROM npc ORDER by id', function(err, results){
        if(err){
            req.flash('error', err);
            res.render('npc/index', {data:''});
        } else {
            res.render('npc/index', { data: results});
        }
    })
})

router.get('/add', authenticationMiddleware(), function(req, res, next){
    res.render('npc/addNPC')
})

// Add NPCs
router.post('/add', authenticationMiddleware(), function(req, res, next){
    const name = req.checkBody('name', 'Name field can not be empty').notEmpty();
    const sex = req.checkBody('sex', 'Select a gender').notEmpty();
    const status = req.checkBody('status', 'Select a status').notEmpty();
    const race = req.checkBody('race', 'Race field cannot not be empty').notEmpty();
    const relationship = req.checkBody('relationship')
    const rosterNPC = req.checkBody('roster_npc').notEmpty();
    const area = req.checkBody('area')
    const desc = req.checkBody('description')

    const errors = req.validationErrors();
    
    if(errors.length > 0){
        res.render('npc/addNPC', {
            errors
        });
    } else {

        const name = req.body.name;
        const sex = req.body.sex;
        const status = req.body.status;
        const race = req.body.race;
        const relationship = req.body.relationship;
        const rosterNPC = req.body.roster_npc;
        const area = req.body.area;
        const desc = req.body.description;

        connection.query('INSERT INTO npc (name, race, sex, relationship, status, roster_npc, area, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [name, race, sex, relationship, status, rosterNPC, area, desc], function(err, result){
            if(err) {
                throw err
            } else {
                res.redirect('/npc')
            }
        })
    }

})

// Get edit npc

router.get('/edit/(:id)', authenticationMiddleware(), function(req, res, next){
    connection.query('SELECT * FROM npc WHERE id = ' + req.params.id, function(err, rows, fields){
        if(err) throw err;

        if(rows.length <= 0){
            req.flash('error', 'NPC not found. Please try again.');
            req.redirect('/npc');
        } else {
            res.render('npc/editNPC', {
                id: rows[0].id,
                name: rows[0].name,
                sex: rows[0].sex,
                status: rows[0].status,
                race: rows[0].race,
                relationship: rows[0].relationship,
                roster_npc: rows[0].roster_npc,
                area: rows[0].area,
                description: rows[0].description
            });
        }
    });
});

// Update npc sql

router.post('/update/:id', authenticationMiddleware(), function(req, res, next){
    const name = req.checkBody('name', 'Name field can not be empty').notEmpty();
    const sex = req.checkBody('sex', 'Select a gender').notEmpty();
    const status = req.checkBody('status', 'Select a status').notEmpty();
    const race = req.checkBody('race', 'Race field cannot not be empty').notEmpty();
    const relationship = req.checkBody('relationship')
    const rosterNPC = req.checkBody('roster_npc').notEmpty();
    const area = req.checkBody('area')
    const desc = req.checkBody('description')

    const errors = req.validationErrors();

    if(errors.length <= 0){
        res.render('/npc/editNPC',{
            errors
        })
    } else {

        var npc = {
            name: req.sanitize('name').escape().trim(),
            sex: req.sanitize('sex').escape().trim(),
            status: req.sanitize('status').escape().trim(),
            race: req.sanitize('race').escape().trim(),
            relationship: req.sanitize('relationship').escape().trim(),
            roster_npc: req.sanitize('roster_npc').escape().trim(),
            area: req.sanitize('area').escape().trim(),
            description: req.sanitize('description').escape().trim()
        }

        connection.query('UPDATE npc SET ? WHERE id = ' + req.params.id, npc, function(err, result){
            if(err){
                console.log(err);
                req.flash('error', err);
                res.render('npc/editNPC', {
                    id: req.params.id,
                    name: req.params.name,
                    sex: req.params.sex,
                    status: req.params.status,
                    race: req.params.race,
                    relationship: req.params.relationship,
                    roster_npc: req.params.roster_npc,
                    area: req.params.area,
                    description: req.params.description
                })
            } else {
                req.flash('success', 'Npc updated!');
                res.redirect('/npc');
            } 
        });
    }
});

// Delete npc

router.get('/delete/(:id)', authenticationMiddleware(), function(req, res, next){
    var npc = {id: req.params.id };

    connection.query('DELETE FROM npc WHERE id = ' + req.params.id, npc, function(err, result){
        if(err){
            req.flash('error', err);
            res.redirect('/npc');
        } else {
            req.flash('success', 'Npc successfully deleted');
            res.redirect('/npc');
        }
    });
});

function authenticationMiddleware(){
    return function(req, res, next){
      
      if(req.isAuthenticated()) return next(
      );
      res.redirect('/login');
    }
  }

module.exports = router;