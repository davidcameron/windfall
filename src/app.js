var app = require('express')();
var server = require('http').createServer(app);
var dispatch = require('./routers/dispatch');

server.listen(8080);

app.get('*', dispatch);