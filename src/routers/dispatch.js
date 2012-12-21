var fs = require('fs');
var util = require('util');

var content = require('../models/brainstorm.js');
var mu = require('mu2');

function dispatch (req, res) {
    var params = req.url.split('/');
    var root = params[1];
    if (root === 'css' || root === 'js' || root === 'favicon.ico') {
        serveStatic(req, res);
    } else {
        serveTemplate (req, res);
    }
}

function serveTemplate (req, res) {

    content.find({name: 'post'})
    .then(content.createFields)
    .then(function (json) {
        var data = {};
        console.log(json);
        data.fields = JSON.parse(json);
        console.log(data);
        res.render('new', data);
    });
}

function serveStatic (req, res) {
    var filePath = './public';
    var contentType = '';
    var params = req.url.split('/');
    switch (params[1]) {

        case '':
            filePath = false;
            break;

        case 'css':
            filePath += req.url;
            contentType = "text/css";
            break;

        case 'js':
            filePath += req.url;
            contentType = "application/javascript";
            break;

        case 'favicon.ico':
            filePath += req.url;
            contentType = "image/x-icon";
            break;
    }
    fs.readFile(filePath, function (error, content) {
        if (error) {
            res.writeHead(501);
            res.end('Big ol\' error!');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

module.exports = dispatch;