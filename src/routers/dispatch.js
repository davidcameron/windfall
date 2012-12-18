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
    mu.clearCache();

    content.find({archetype: 'post'})
    .then(content.populate)
    .then(function (records) {
        var templateData = {};
        templateData.records = [];
        
        var recordsLength = records.length;
        for(var i = 0; i < recordsLength; i++) {
            templateData.records.push(records[i].data);
        }

        templateData.test = "Test!";
        console.log(templateData);
        res.render('index', templateData);
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