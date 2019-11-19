var express = require('express');
var router = express.Router();
var connection = require('../db/db');

// Character index page
router.get('/', function(req, res, next) {
    connection.query('SELECT * FROM characters ORDER BY id', function(err, results){
        if(err){
            req.flash('error', err);
            res.render('characters/index', {data:''});
        }
        else{
            res.render('characters/index', {data:results});
        }
    });
});

// Route to add page
router.get('/add', authenticationMiddleware(), function(req, res, next){
    res.render('characters/add')
})

// Add character SQL

router.post('/add', authenticationMiddleware(), function(req, res, next){
    req.assert('Name', 'Name is required').notEmpty()
    req.assert('Class', 'Class is Required').notEmpty()
    req.assert('Level', "Level is required").notEmpty().isNumeric()
    req.assert('Race', 'Race is required').notEmpty()

    var errors = req.validationErrors()

    if(!errors){
        var character = {
            Name: req.sanitize('Name').escape().trim(),
            Class: req.sanitize('Class').escape().trim(),
            Level: req.sanitize('Level').escape().trim(),
            Experience: req.sanitize('Experience').escape().trim(),
            Race: req.sanitize('Race').escape().trim(),
            Age: req.sanitize('Age').escape().trim(),
            Description: req.sanitize('Description').escape().trim(),
            Health: req.sanitize('Health').escape().trim(),
            Armor: req.sanitize('Armor').escape().trim(),
            DamReduction: req.sanitize('DamReduction').escape().trim(),
            Mana: req.sanitize('Mana').escape().trim(),
            Stamina: req.sanitize('Stamina').escape().trim(),
            StrScore: req.sanitize('strScore').escape().trim(),
            StrMod: req.sanitize('strMod').escape().trim(),
            StrDesc: req.sanitize('strDesc').escape().trim(),
            DexScore: req.sanitize('dexScore').escape().trim(),
            DexMod: req.sanitize('dexMod').escape().trim(),
            DexDesc: req.sanitize('dexDesc').escape().trim(),
            ConScore: req.sanitize('conScore').escape().trim(),
            ConMod: req.sanitize('conMod').escape().trim(),
            ConDesc: req.sanitize('conDesc').escape().trim(),
            IntScore: req.sanitize('intScore').escape().trim(),
            IntMod: req.sanitize('intMod').escape().trim(),
            IntDesc: req.sanitize('intDesc').escape().trim(),
            WisScore: req.sanitize('wisScore').escape().trim(),
            WisMod: req.sanitize('wisMod').escape().trim(),
            WisDesc: req.sanitize('wisDesc').escape().trim(),
            ChaScore: req.sanitize('chaScore').escape().trim(),
            ChaMod: req.sanitize('chaMod').escape().trim(),
            ChaDesc: req.sanitize('chaDesc').escape().trim()
        }

        connection.query('INSERT INTO characters SET ?', character, function(err, result){
            if(err){
                req.flash('error', err)
                res.render('character/add', {Name: character.Name, Class: character.Class, Level: character.Level, Race: character.Race})
            } else {
                req.flash('success', 'Character successfully created');
                res.redirect('/characters');
            }
        })
    } else {
        var error_msg = ''
        errors.forEach(function(error) {
            error_msg += error_msg + '<br>'
        })
        req.flash('error', error_msg)

        res.render('characters/add', {Name: req.body.Name, Class: req.body.Class, Level: req.body.Level, Race: req.body.Race})
    }
});

// route to view page

const queryWrapper = function(statement){
    return new Promise(function(resolve, reject){
        connection.query(statement, function(err, result){
            if(err)
                return reject(err);
            resolve(result);
        });
    });
};

router.get('/view/(:id)', function(req,res,next){

// var characterInfo = " + ";SELECT s.name, s.spellEffect FROM characters AS c, knownspells AS k, spells AS s WHERE c.id = " + req.params.id + " AND c.id = k.knownSpell_id And k.spell_id = s.id";

    Promise.all([
        queryWrapper('SELECT * FROM characters WHERE id = ' + req.params.id),
        queryWrapper('SELECT s.name, s.mana, s.spellEffect FROM characters AS c, knownspells AS k, spells AS s WHERE c.id = ' + req.params.id + ' AND c.id = k.knownSpell_id And k.spell_id = s.id')
    ])
    .then(function([characters, spells]){
        res.render('characters/view',{ 
            characters,
            spells
        });
    })
    .catch(err => {
        console.err(err);
        res.redirect('/characters');
    })
})

// Add spells to character

router.get('/addSpellToCharacter/(:id)', authenticationMiddleware(), function(req, res, next){
    var charId = req.params.id;

    console.log(charId);

    connection.query('SELECT * FROM spells ORDER BY id', function(err, results){
        if(err){
            req.flash('error', err)
            res.redirect('/characters/view/(:id)')
        } else {
            res.render('characters/addSpellToCharacter', {data:results,charId})
        }
    })
})

router.post('/addSpellToCharacter/:charId', authenticationMiddleware(), function(req,res,next){
    var char_Id = req.params.charId;

    req.assert('id', 'Spell id must be numeric').isNumeric()

    var errors = req.validationErrors()

    if(!errors){
        console.log(char_Id);
            id = req.body.id

    }

    connection.query('INSERT INTO knownspells(knownSpell_id, spell_id) VALUES (' + char_Id + ',' + id + ')', function(err,result){
        if(err){
            req.flash('error', err)
            res.redirect('/view/' + char_Id)
        } 
        else {
            res.end()
            res.render('/view/' + char_Id)
        }
    })
})

// Route to edit character

router.get('/edit/(:id)', authenticationMiddleware(), function(req, res, next){

    connection.query('SELECT * FROM characters WHERE id = ' + req.params.id, function(err, rows, fields) {
        if(err) throw err

        if(rows.length <= 0) {
            req.flash('error', 'Character not found')
            res.redirect('/characters')
        } else {
            res.render('characters/edit', {
                id: rows[0].id,
                Name: rows[0].Name,
                Class: rows[0].Class,
                Level: rows[0].Level,
                Experience: rows[0].Experience,
                Race: rows[0].Race,
                Age: rows[0].Age,
                Description: rows[0].Description,
                Health: rows[0].Health,
                Armor: rows[0].Armor,
                DamReduction: rows[0].DamReduction,
                Mana: rows[0].Mana,
                Stamina: rows[0].Stamina,
                StrScore: rows[0].StrScore,
                StrMod: rows[0].StrMod,
                StrDesc: rows[0].StrDesc,
                DexScore: rows[0].DexScore,
                DexMod: rows[0].DexMod,
                DexDesc: rows[0].DexDesc,
                ConScore: rows[0].ConScore,
                ConMod: rows[0].ConMod,
                ConDesc: rows[0].ConDesc,
                IntScore: rows[0].IntScore,
                IntMod: rows[0].IntMod,
                IntDesc: rows[0].IntDesc,
                WisScore: rows[0].WisScore,
                WisMod: rows[0].WisMod,
                WisDesc: rows[0].WisDesc,
                ChaScore: rows[0].ChaScore,
                ChaMod: rows[0].ChaMod,
                ChaDesc: rows[0].ChaDesc
            })
        }
    }) 
});

// UPDATE sql

router.post('/update/:id', authenticationMiddleware(), function(req, res, next){
    req.assert('Name', 'Name is required').notEmpty()
    req.assert('Class', 'Class is Required').notEmpty()
    req.assert('Level', "Level is required").notEmpty().isNumeric()
    req.assert('Race', 'Race is required').notEmpty()

    var errors = req.validationErrors()

    if(!errors){
        var character = {
            Name: req.sanitize('Name').escape().trim(),
            Class: req.sanitize('Class').escape().trim(),
            Level: req.sanitize('Level').escape().trim(),
            Experience: req.sanitize('Experience').escape().trim(),
            Race: req.sanitize('Race').escape().trim(),
            Age: req.sanitize('Age').escape().trim(),
            Description: req.sanitize('Description').escape().trim(),
            Health: req.sanitize('Health').escape().trim(),
            Armor: req.sanitize('Armor').escape().trim(),
            DamReduction: req.sanitize('DamReduction').escape().trim(),
            Mana: req.sanitize('Mana').escape().trim(),
            Stamina: req.sanitize('Stamina').escape().trim(),
            StrScore: req.sanitize('strScore').escape().trim(),
            StrMod: req.sanitize('strMod').escape().trim(),
            StrDesc: req.sanitize('strDesc').escape().trim(),
            DexScore: req.sanitize('dexScore').escape().trim(),
            DexMod: req.sanitize('dexMod').escape().trim(),
            DexDesc: req.sanitize('dexDesc').escape().trim(),
            ConScore: req.sanitize('conScore').escape().trim(),
            ConMod: req.sanitize('conMod').escape().trim(),
            ConDesc: req.sanitize('conDesc').escape().trim(),
            IntScore: req.sanitize('intScore').escape().trim(),
            IntMod: req.sanitize('intMod').escape().trim(),
            IntDesc: req.sanitize('intDesc').escape().trim(),
            WisScore: req.sanitize('wisScore').escape().trim(),
            WisMod: req.sanitize('wisMod').escape().trim(),
            WisDesc: req.sanitize('wisDesc').escape().trim(),
            ChaScore: req.sanitize('chaScore').escape().trim(),
            ChaMod: req.sanitize('chaMod').escape().trim(),
            ChaDesc: req.sanitize('chaDesc').escape().trim()
        }

        connection.query('UPDATE characters SET ? WHERE id = ' + req.params.id, character, function(err, result){
            if(err) {
                req.flash('error', err)
                res.render('characters/edit', {
                    id: req.params.id,
                    Name: req.body.Name,
                    Class: req.body.Class,
                    Level: req.body.Level,
                    Experience: req.body.Experience,
                    Race: req.body.Race,
                    Age: req.body.Age,
                    Description: req.body.Description,
                    Health: req.body.Health,
                    Armor: req.body.Armor,
                    DamReduction: req.body.DamReduction,
                    Mana: req.body.Mana,
                    Stamina: req.body.Stamina,
                    StrScore: req.body.StrScore,
                    StrMod: req.body.StrMod,
                    StrDesc: req.body.StrDesc,
                    DexScore: req.body.DexScore,
                    DexMod: req.body.DexMod,
                    DexDesc: req.body.DexDesc,
                    ConScore: req.body.ConScore,
                    ConMod: req.body.ConMod,
                    ConDesc: req.body.ConDesc,
                    IntScore: req.body.IntScore,
                    IntMod: req.body.IntMod,
                    IntDesc: req.body.IntDesc,
                    WisScore: req.body.WisScore,
                    WisMod: req.body.WisScore,
                    WisDesc: req.body.WisDesc,
                    ChaScore: req.body.ChaScore,
                    ChaMod: req.body.ChaMod,
                    ChaDesc: req.body.ChaDesc
                })
            } else {
                req.flash('success', 'Data updated!');
                res.redirect('/characters');
            }
        })
    } else {
        var error_msg = ''
        errors.forEach(function(error){
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)
        res.render('characters/edit', {
            id: req.params.id,
            Name: req.body.Name,
            Class: req.body.Class,
            Level: req.body.Level,
            Experience: req.body.Experience,
            Race: req.body.Race,
            Age: req.body.Age,
            Description: req.body.Description,
            Health: req.body.Health,
            Armor: req.body.Armor,
            DamReduction: req.body.DamReduction,
            Mana: req.body.Mana,
            Stamina: req.body.Stamina,
            StrScore: req.body.StrScore,
            StrMod: req.body.StrMod,
            StrDesc: req.body.StrDesc,
            DexScore: req.body.DexScore,
            DexMod: req.body.DexMod,
            DexDesc: req.body.DexDesc,
            ConScore: req.body.ConScore,
            ConMod: req.body.ConMod,
            ConDesc: req.body.ConDesc,
            IntScore: req.body.IntScore,
            IntMod: req.body.IntMod,
            IntDesc: req.body.IntDesc,
            WisScore: req.body.WisScore,
            WisMod: req.body.WisScore,
            WisDesc: req.body.WisDesc,
            ChaScore: req.body.ChaScore,
            ChaMod: req.body.ChaMod,
            ChaDesc: req.body.ChaDesc
        })
    }
})

// Delete record

router.get('/delete/(:id)', authenticationMiddleware(), function(req,res,next) {
    var character = {id: req.params.id }

    connection.query('DELETE FROM characters WHERE id = ' + req.param.id, character, function(err, result){
        if(err){
            req.flash('error', err)
            res.redirect('/characters')
        } else {
            req.flash('success', 'Character successfully deleted')
            res.redirect('/characters')
        }
    }) 
})

function authenticationMiddleware(){
    return function(req, res, next){
      
      if(req.isAuthenticated()) return next(
      );
      res.redirect('/login');
    }
  }

module.exports = router;