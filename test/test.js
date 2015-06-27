var template = require('../index');
var path = require('path');

template({
  name: 'Webura Template Test',
  serverPort: 3000,
  mongoose: {
    server: 'localhost',
    port: 27017,
    user: '',
    password: '',
    database: 'test'
  },
  smtp: {
    fromEmail: '',
    supportEmail: '',
    server: '',
    user: '',
    password: ''
  },
  secret: '',
  errorPages: {
    '500': '<html><head><title>500</title></head><body><h1>Error page</h1></body></html>',
    '404': '<html><head><title>404</title></head><body><h1>Page not found</h1></body></html>'
  },
  public: {
    url: '/public',
    path: path.join(__dirname, 'public')
  },
  workers: 1,
  middlewares: function (app) {
    var express = require('express');
    var router = express.Router();
    router.get('/', function (req, res) {
      console.log(process.pid);
      res.send('<html><head><title>Test</title><link href="/public/test.css" rel="stylesheet" type="text/css"></head><body><h1>Hello world!</h1></body></html>');
    });
    router.get('/error', function (req, res) {
      throw new Error('Sync error');
    });
    router.get('/error2', function (req, res) {
      setTimeout(function () {
        throw new Error('Async error');
      }, 100);
    });
    app.use('/', router);
  }
});
