const express = require('express');
const app = express(); //server-app


app.use(express.static('client'));

// global for all routes -------------------------
app.use(function(req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    next(); //go to the specified route
});

// -----------------------------------------------
//route handling is delegated to:
var liste = require('./liste.js');
app.use('/ToDo/liste/', liste);


var login = require('./login.js');
app.use('/ToDo/login/', login);

//------------------------------------------------
var port = process.env.PORT || 8080;
app.listen(port, function () {
 
});



