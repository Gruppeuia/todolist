
var express = require('express');
var router = express.Router();
var db = require('./dbconnect'); //database
var bodyParser = require('body-parser').text();
var jwt = require("jsonwebtoken");
var bcrypt = require('bcrypt');

var secret = "frenchfriestastegood!"; //used to create the token

//endpoint: POST users/ -----------------------------
router.post('/', bodyParser, function (req, res) {

    var upload = JSON.parse(req.body);
    var encrPassw = bcrypt.hashSync(upload.password, 10); //hash the password    

    var sql = `PREPARE insert_loginn (text, text, int, text) AS
                INSERT INTO login VALUES( $1, $2, DEFAULT, $4); EXECUTE insert_loginn
                ('${upload.loginname}', '${encrPassw}', 0, '${upload.fullname}')`;
    
    console.log(sql);
    

    db.any(sql).then(function(data) {

        db.any("DEALLOCATE insert_loginn");
        
        //create the token        
        var payload = {loginname: upload.loginname, fullname: upload.fullname};
        var tok = jwt.sign(payload, secret, {expiresIn: "12h"});

        //send logininfo + token to the client
        res.status(200).json({loginname: upload.loginname, fullname: upload.fullname, token: tok}); 

    }).catch(function(err) {

        res.status(500).json({err});

    });
});

//endpoint for login: POST users/auth/ ----------------
router.post('/auth/', bodyParser, function (req, res) {
    
    var upload = JSON.parse(req.body); //should be sanitized
    
    var sql = `PREPARE get_loginn (text) AS
                    SELECT * FROM login WHERE loginname=$1;
                    EXECUTE get_loginn('${upload.loginname}')`;
    
    console.log(sql);

    db.any(sql).then(function(data) {

        db.any("DEALLOCATE get_loginn");

        //if wrong user or password -> quit  
        if (data.length <= 0) {
            res.status(403).json({msg: "Login name does not exists"}); //send
            return; //quit
        } else {
            
            //check if the password is correct
            var psw = upload.password;
            var encPsw = data[0].password;
            var result = bcrypt.compareSync(psw, encPsw);
            
            if (!result) {
                res.status(403).json({msg: "Wrong password"}); //send
                return; //quit
            }            
        }

        //we have a valid user -> create the token        
        var payload = {loginname: data[0].loginname, fullname: data[0].fullname};
        var tok = jwt.sign(payload, secret, {expiresIn: "12h"});

        //send logininfo + token to the client
        res.status(200).json({loginname: data[0].loginname, fullname: data[0].fullname, token: tok});

    }).catch(function(err) {

        res.status(500).json({err});
        
    });    
});

//export module -------------------------------------
module.exports = router;


//bcrypt -----------------------------------------------------
//var hash = bcrypt.hashSync(myPlaintextPassword, saltRounds);
//var result = bcrypt.compareSync(myPlaintextPassword, hash);
