var app = require('express')(),
    server = require('http').createServer(app),
    cons = require('consolidate'),
    dispatch = require('./routers/dispatch');

app.engine('html', cons.swig);

app.set('view engine', 'html');
console.log(__dirname);
app.set('views', __dirname + '/views');

server.listen(8080);

app.get('*', dispatch);