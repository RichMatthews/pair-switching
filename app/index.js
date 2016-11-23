var express = require('express');
var app = express();
var axios = require('axios');

app.use('/', express.static('public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.listen(process.env.PORT || 8080);
