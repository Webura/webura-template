# webura-template
Lazy template for quick projects using Express and Mongoose. 

## Install
`npm install webura-template --save`

Notice that Express and Mongoose are not bundled so you can control which version to use.
Express is required and Mongoose is optional

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

## Features
On server errors (both synchronous and asynchronous), the server will email the support email and then restart itself.
Basic middlewares like compressor, cookie-parser, body-parser are included. It is roughly 200 lines, so you can actually just fork it and modify yourself.


## Licence
(The MIT License)

Copyright (c) 2015 Johnny Tsang &lt;johnny@webura.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.