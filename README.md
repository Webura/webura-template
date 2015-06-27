# webura-template
Lazy template for quick projects using Express and Mongoose. Including compressor, cookie-parser, body-parser.

## Install
`npm install webura-template --save`

If you use Mongoose you need to install it too. Not bundled, due to version

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
    from: '',
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
  middlewares: function (app) {
    var router = template.Router();
    router.get('/', function (req, res) {
      res.send('<html><head><title>Test</title><link href="/public/test.css" rel="stylesheet" type="text/css"></head><body><h1>Hello world!</h1></body></html>');
    });
    app.use('/', router);
  }
});
```


