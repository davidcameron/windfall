var fs = require('fs');
var util = require('util');

var content = require('../models/brainstorm.js');
var mu = require('mu2');

var crudURLs = ['create', 'read', 'update', 'destroy'];

function dispatch (req, res) {
    var params = req.url.split('/');
    var root = params[1];
    if (root === 'css' || root === 'js' || root === 'favicon.ico') {
        serveStatic(req, res);
    } else if (crudURLs.indexOf(root) !== -1) {
        dispatchCRUD (params, req, res);
    } // Add in API
}

function dispatchCRUD (params, req, res) {
    var root = params[1];
    switch (root) {

        case crudURLs[0]: // create
            serveCreate(params, req, res);
            break;

        case crudURLs[1]: // create
            serveRead(params, req, res);
            break;

        case crudURLs[2]: // create
            serveUpdate(params, req, res);
            break;

        case crudURLs[3]: // create
            serveDelete(params, req, res);
            break;
    }
}

function serveCreate (params, req, res) {
    content.find({name: params[2]})
    .then(content.createFields)
    .then(function (json) {
        var data = {};
        data.fields = JSON.parse(json);
        res.render('create', data);
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