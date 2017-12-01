var express = require('express');
var router = express.Router();
var db = require('./dbconnect'); //database
var bodyParser = require('body-parser').text();
var jwt = require("jsonwebtoken");

var secret = "frenchfriestastegood!"; //used to check the token
var logindata; //logindata from the token

//Authorize all travel-endpoints --------------------


router.use(function (req, res, next) { 
    
   
    
    //get the token from the URL-variable named 'token'
    var token = req.query['token']; 

    if (!token) {
        res.status(403).json({msg: "No token received"}); //send
        return; //quit
    }
    else {
        try {
          logindata = jwt.verify(token, secret); //check the token
        }
        catch(err) {
          res.status(403).json({msg: "The token is not valid!"}); //send
          return; //quit
        }
    }
    
    next(); //we have a valid token - go to the requested endpoint
});




//endpoint: GET travels -----------------------------
router.get('/', bodyParser, function (req, res) {   
    
    
    
    var sql = `PREPARE get_listenavn (text) AS 
    SELECT * FROM todoview WHERE loginname=$1 ORDER BY listeid;
    EXECUTE get_listenavn ('${logindata.loginname}')`;
    db.any(sql).then(function(data) {        
        
        res.status(200).json(data); //success – send the data as JSON!

    }).catch(function(err) {        
        
        res.status(500).json(err);
        
    });   
});

//endpoint: POST travels ----------------------------
router.post('/', bodyParser, function (req, res) {   
    
    var upload = JSON.parse(req.body);
    
    console.log("jkhkj");
    
   
    
   /*var sql = `PREPARE insert_list (int, text, text, Date, int, Boolean, text) AS
                INSERT INTO liste VALUES(DEFAULT, $2, $3, $4, $5, $6, $7); EXECUTE insert_list
                (0, '${upload.listenavn}', '${upload.beskrivelse}', '${upload.tid}', '${upload.prioritet}, '${upload.status}', '${logindata.loginname}')`;*/
    
     var sql = `PREPARE insert_list (int, text, text, date, int, boolean, text) AS
     INSERT INTO liste VALUES (DEFAULT, $2, $3, $4, DEFAULT, DEFAULT, $7); EXECUTE insert_list
     (0, '${upload.listenavn}', '${upload.beskrivelse}', '${upload.tid}', 0, true, '${logindata.loginname}')`;
       
    console.log(sql);
    
    
    
    db.any(sql).then(function(data) { 
        
	db.any("DEALLOCATE insert_list");        
	res.status(200).json({msg: "insert ok"}); //success!

    }).catch(function(err) {        
        
        	res.status(500).json(err);
        
    });   
});

//endpoint: DELETE travels -----------------------------
router.delete('/', function (req, res) { 
    
    console.log(req.query);
    
    var upload = req.query.listeid; //uploaded data should be sanitized
    
    var sql = `PREPARE delete_list (int, text) AS
            DELETE FROM liste WHERE listeid=$1 AND loginname=$2 RETURNING *;
            EXECUTE delete_list('${upload}', '${logindata.loginname}')`; 
    console.log(sql);
    
    db.any(sql).then(function(data) {
        
        db.any("DEALLOCATE delete_list");       
        
        if (data.length > 0) {
            res.status(200).json({msg: "delete ok"}); //success!
        }
        else {
            res.status(200).json({msg: "can't delete"});
        }       

    }).catch(function(err) {
        res.status(500).json(err);        
    });   
});



//export module -------------------------------------
module.exports = router;


