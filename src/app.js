var app = require('express')();
var server = require('http').createServer(app);
var serveStatic = require('./routers/static');

server.listen(8080);

app.get('*', serveStatic);