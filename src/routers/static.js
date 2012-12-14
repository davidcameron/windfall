var fs = require('fs');
var util = require('util');

var content = require('../models/brainstorm.js');
var mu = require('mu2');

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
    if (filePath !== false) {
        fs.readFile(filePath, function (error, content) {
            if (error) {
                res.writeHead(501);
                res.end('Big ol\' error!');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    } else { // Mustashe!
        mu.clearCache();

        content.find('better-post')
        .then(content.populate)
        .then(function (record) {
            var json = JSON.stringify(record.data);
            res.writeHead(200, {'Content-Type': 'text/html'});

            var content = mu.compileAndRender('./public/index.html', record.data);

            console.log('content:', content);
            util.pump(content, res);
            
        });
    }
}

module.exports = serveStatic;