# webura-template
Lazy template for quick projects using Express and Mongoose. Including compressor, cookie-parser, body-parser.

## Install
`npm install webura-template --save`

Notice that Express and Mongoose are not bundles, so you can control which version to use.
Mongoose is optional

`npm install express --save`
`npm install mongoose --save`

## Usage
```
var template = require('webura-template');
var path = require('path');

template({
  name: 'Webura Template Test',
  serverPort: 3000,
  mongoose: {
    server: 'localhost',
    port: 27017,
    user: '',
    password: '',
    database: 'webura-template'
  },
  smtp: {
    server: '',
    user: '',
    password: '',
    fromEmail: '',
    supportEmail: ''
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
      res.send('<html><head><title>Test</title><link href="/public/test.css" rel="stylesheet" type="text/css"></head><body><h1>Hello world!</h1></body></html>');
    });
    app.use('/', router);
  }
});
```


