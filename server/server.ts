/// <reference path="./external/node/node.d.ts" />
/// <reference path="./external/serve-static/serve-static.d.ts" />


var connect     = require('connect')
  , morgan      = require('morgan')
  , serveStatic = require('serve-static');

var app = connect()
    .use(morgan('tiny'))
    .use(serveStatic('../client/'))
    .use(function(req: any, res: any, next: any) {
        req.url = './index.html';
        next();
    })
    .use(serveStatic('../client/'))
    .listen(8080);