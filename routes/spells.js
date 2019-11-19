var express = require('express');
var router = express.Router();
var connection = require('../db/db');
const passport = require('passport');

// Spells index page
router.get('/', function(req, res, next) {
    connection.query('SELECT * FROM spells ORDER BY id', function(err, results){
        if(err){
            req.flash('error', err);
            res.render('spells/index', {data:''});
        }
        else{
            res.render('spells/index', {
                data: results
            });
        }
    });
});

// Add spell

router.get('/addSpell', authenticationMiddleware(), function(req,res,next){
    res.render('spells/addSpell')
})

// Add spell sql

router.post('/addSpell', authenticationMiddleware(), function(req, res, next){
    req.assert('name', 'Name is required').notEmpty()
    req.assert('type', 'Spell type is required').notEmpty()
    req.assert('level', 'Spell level is required').notEmpty()
    req.assert('glyphs', 'Glyphs are required').notEmpty()
    req.assert('duration', 'Spell requires a duration').notEmpty()
    req.assert('mana', 'Spell must have a mana cost').notEmpty()
    req.assert('action', 'Action cost is required').notEmpty()
    req.assert('spellEffect', 'Spell effects are required').notEmpty()
    req.assert('boon', 'Boon is required').notEmpty()
    req.assert('sevenPlus', '7+ effect is required').notEmpty()
    req.assert('fivePlus', '5+ effect is required').notEmpty()

    var errors = req.validationErrors();

    if(!errors){
        var spell = {
            name: req.sanitize('name').escape().trim(),
            type: req.sanitize('type').escape().trim(),
            level: req.sanitize('level').escape().trim(),
            manifest: req.sanitize('manifest').escape().trim(),
            glyphs: req.sanitize('glyphs').escape().trim(),
            duration: req.sanitize('duration').escape().trim(),
            mana: req.sanitize('mana').escape().trim(),
            action: req.sanitize('action').escape().trim(),
            spellEffect: req.sanitize('spellEffect').escape().trim(),
            boon: req.sanitize('boon').escape().trim(),
            sevenPlus: req.sanitize('sevenPlus').escape().trim(),
            fivePlus: req.sanitize('fivePlus').escape().trim()
        }

        connection.query('INSERT INTO spells SET ?', spell, function(err, result){
            if(err){
                req.flash('error', err)
                res.render('spells/addSpell', {name: spell.name, type: spell.type, level: spell.level, manifest: spell.manifest, glyphs: spell.glyphs, duration: spell.duration, mana: spell.mana, action: spell.action, spellEffect: spell.spellEffect, boon: spell.boon, sevenPlus: spell.sevenPlus, fivePlus: spell.fivePlus})
            } else {
                req.flash('success', 'Spell Added');
                res.redirect('/spells');
            }
        })
    } 
    else {
        var error_msg = ''
        Object.keys(errors).foreach(function(error){
            error_msg += error_msg + '<br>'
        })
        req.flash('error', error_msg)

        res.render('spells/addSpell', {name: req.body.name, type: req.body.type, level: req.body.level, manifest: req.body.manifest, glyphs: req.body.glyphs, duration: req.body.duration, mana: req.body.mana, action: req.body.action, spellEffect: req.body.spellEffect, boon: req.body.boon, sevenPlus: req.body.sevenPlus, fivePlus: req.body.fivePlus})
    }
})

// Get edit spell page

router.get('/edit/(:id)', authenticationMiddleware(), function(req, res, next){
    connection.query('SELECT * FROM spells WHERE id = ' + req.params.id, function(err, rows, fields){
        if(err) throw err;

        if(rows.length <= 0){
            req.flash('error', 'Spell not found. Please try again.');
            res.redirect('/spells');
        } else {
            res.render('spells/editSpell', {
                id: rows[0].id,
                name: rows[0].name,
                type: rows[0].type,
                level: rows[0].level,
                manifest: rows[0].manifest,
                glyphs: rows[0].glyphs,
                duration: rows[0].duration,
                mana: rows[0].mana,
                action: rows[0].action,
                spellEffect: rows[0].spellEffect,
                boon: rows[0].boon,
                sevenPlus: rows[0].sevenPlus,
                fivePlus: rows[0].fivePlus
            });
        }
    });
});

// Update spell sql

router.post('/update/:id', authenticationMiddleware(), function(req, res, next){
    req.assert('name', 'Name is required').notEmpty()
    req.assert('type', 'Spell type is required').notEmpty()
    req.assert('level', 'Spell level is required').notEmpty().isNumeric()
    req.assert('glyphs', 'Glyphs are required').notEmpty()
    req.assert('duration', 'Spell requires a duration').notEmpty()
    req.assert('mana', 'Spell must have a mana cost').notEmpty()
    req.assert('action', 'Action cost is required').notEmpty()
    req.assert('spellEffect', 'Spell effects are required').notEmpty()
    req.assert('boon', 'Boon is required').notEmpty()
    req.assert('sevenPlus', '7+ effect is required').notEmpty()
    req.assert('fivePlus', '5+ effect is required').notEmpty()

    const errors = req.validationErrors();

    console.log(errors);
    if(errors.length <= 0){
        res.render('/spells/editSpell', {
            errors
        });
    } else {
        var spell = {
            name: req.sanitize('name').escape().trim(),
            type: req.sanitize('type').escape().trim(),
            level: req.sanitize('level').escape().trim(),
            manifest: req.sanitize('manifest').escape().trim(),
            glyphs: req.sanitize('glyphs').escape().trim(),
            duration: req.sanitize('duration').escape().trim(),
            mana: req.sanitize('mana').escape().trim(),
            action: req.sanitize('action').escape().trim(),
            spellEffect: req.sanitize('spellEffect').escape().trim(),
            boon: req.sanitize('boon').escape().trim(),
            sevenPlus: req.sanitize('sevenPlus').escape().trim(),
            fivePlus: req.sanitize('fivePlus').escape().trim()
        }
    
        connection.query('UPDATE spells SET ? WHERE id = ' + req.params.id, spell, function(err, result){
            if(err){
                console.log(err);
                req.flash('error', err);
                res.render('/spells/editSpell', {
                    id: req.params.id,
                    name: req.params.name,
                    type: req.params.type,
                    level: req.params.level,
                    manifest: req.params.manifest,
                    glyphs: req.params.glyphs,
                    duration: req.params.duration,
                    mana: req.params.mana,
                    action: req.params.action,
                    spellEffect: req.params.spellEffect,
                    boon: req.params.boon,
                    sevenPlus: req.params.sevenPlus,
                    fivePlus: req.params.fivePlus
                })
            } else {
                req.flash('success', 'Spell updated!');
                res.redirect('/spells');
            }
        });
    }
});

// Delete spell

router.get('/delete/(:id)', authenticationMiddleware(), function(req, res, next){
    var spell = {id: req.params.id };

    connection.query('DELETE FROM spells WHERE id = ' + req.params.id, spells, function(err, result){
        if(err){
            req.flash('error', err);
            res.redirect('/spells');
        } else {
            req.flash('success', 'Spell successfully deleted!');
            res.redirect('/spells');
        }
    });
});

router.get('/ajax/spells', function(req,res,next){
    connection.query('SELECT id FROM spells', function(err, result){
        if(err){
            req.flash('error', err);
        } else {
            res.send(result);
        }
    })
})

function authenticationMiddleware(){
    return function(req, res, next){
      
      if(req.isAuthenticated()) return next(
      );
      req.flash('error', 'You need to be signed to complete this action!');
      res.redirect('/spells');
    }
  }

module.exports = router;