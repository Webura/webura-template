var template = function (options) {
  /*--SETTINGS----------------------------------------------------------------------------------*/
  var extend = require('extend');
  var settings = {
    name: 'Webura-Template',
    serverPort: 3000,
    mongoose: {
      server: null,
      port: null,
      user: null,
      password: null,
      database: null
    },
    smtp: {
      server: null,
      user: null,
      password: null,
      fromEmail: null,
      supportEmail: null
    },
    cookie: {
      secret: '',
      maxAge: 1000 * 60 * 60 * 24 * 30
    },
    secret: 'randomABC123!',
    errorPages: {
      '500': '<html><head><title>500</title></head><body><h1>Error page</h1></body></html>',
      '404': '<html><head><title>404</title></head><body><h1>Page not found</h1></body></html>'
    },
    public: {
      url: null,
      path: null
    },
    workers: 1,
    allowedMemoryLeak: 50 * 1000000,//50MB
    checkMemoryLeakInterval: 1000 * 60 * 60,// 60 minutes
    middlewares: function () {
    }
  };
  if (options)
    extend(settings, options);
  /*--EMAIL----------------------------------------------------------------------------------*/
  var transporter;
  if (settings.smtp.server) {
    var nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      host: settings.smtp.server,
      auth: {
        user: settings.smtp.user,
        pass: settings.smtp.password
      },
      secure: true
    });
  }
  template.emailSupport = function (subject, body, callback) {
    template.email(settings.smtp.supportEmail, subject, body, callback);
  };
  template.email = function (to, subject, body, callback) {
    if (!transporter) {
      console.log(to);
      console.log(subject);
      console.log(body);
      if (callback)
        callback();
    } else {
      var options = {
        from: settings.smtp.fromEmail,
        to: to,
        subject: subject,
        text: body
      };
      transporter.sendMail(options, function (err, result) {
        if (err)
          console.error('Email error:', err);
        if (callback)
          callback(err, result);
      });
    }
  };
  template.emailHtml = function (to, subject, body, callback) {
    if (!transporter) {
      console.log(to);
      console.log(subject);
      console.log(body);
      if (callback)
        callback();
    } else {
      var options = {
        from: settings.smtp.fromEmail,
        to: to,
        subject: subject,
        html: body
      };
      transporter.sendMail(options, function (err, result) {
        if (err)
          console.error('Email error:', err);
        if (callback)
          callback(err, result);
      });
    }
  };
  /*--EXPRESS----------------------------------------------------------------------------------*/
  process.env.TZ = 'UTC';
  var cluster = require('cluster');
  process.on('uncaughtException', function (err) {
    if (err && err.stack)
      template.emailSupport(settings.name + ' uncaught exception: ' + err.message, err.stack.toString(), function () {
        process.exit();
      });
    else
      template.emailSupport(settings.name + ' uncaught exception', '', function () {
        process.exit();
      });
  });
  //--------CLUSTER MASTER------------------------------------------------------------------------------------------
  if (cluster.isMaster) {
    console.log('SERVER: %s started', process.pid);
    var lastRestart = Date.now();

    function fork() {
      cluster.fork();
      lastRestart = Date.now();
    }

    for (var i = 0; i < settings.workers; ++i)
      fork();
    cluster.on('exit', function (worker) {
      console.error('WORKER: %s died.', worker.process.pid);
      if ((Date.now() - lastRestart) > 2000)
        fork();
      else {
        console.error('SERVER: died');
        template.emailSupport(settings.name + ' too frequent failure of workers, will not fork', '');
      }
    });
  } else {
    //--------CLUSTER WORKER------------------------------------------------------------------------------------------
    console.log('WORKER: %s started', process.pid);
    var express = require('express');
    var app = express();
    var bodyParser = require('body-parser');

    if (settings.mongoose.server) {
      var mongoose = require('mongoose');
      mongoose.connect('mongodb://' +
        (settings.mongoose.user && settings.mongoose.password ? settings.mongoose.user + ':' + settings.mongoose.password + '@' : '') +
        settings.mongoose.server + ':' + settings.mongoose.port + '/' + settings.mongoose.database, { useMongoClient: true },
        function (err) {
          if (err)
            console.error('MONGODB: ' + err);
          else
            console.log('MONGODB: connected');
        });
    }

    //--------COMMON MIDDLEWARES-------------------------------------------------------------------------------
    app.set('x-powered-by', false);
    app.use(require('compression')());
    app.use(function (req, res, next) {
      var domain = require('domain');
      var reqDomain = domain.create();
      reqDomain.add(req);
      reqDomain.add(res);
      res.on('close', function () {
        reqDomain.dispose();
      });
      reqDomain.on('error', function (err) {
        res.status(500).end(settings.errorPages['500'], function () {
          template.emailSupport(settings.name + ' caught error: ' + req.originalUrl, err.stack.toString(), function () {
            process.exit();
          });
        });
      });
      reqDomain.run(next);
    });
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    if (settings.cookie.secret) {
      var cookieParser = require('cookie-parser');
      app.use(cookieParser(settings.cookie.secret, { maxAge: settings.cookie.maxAge }));
    }
    app.use(function logger(req, res, next) {
      console.log(req.method + ': ' + req.originalUrl);
      next();
    });
    if (settings.public.url && settings.public.path)
      app.use(settings.public.url, express.static(settings.public.path, { maxAge: '30d' }));
    if (settings.middlewares)
      settings.middlewares(app);
    app.use(function (req, res, next) {
      res.status(404).end(settings.errorPages['404']);
    });
    app.use(function (err, req, res, next) {
      res.status(500).end(settings.errorPages['500']);
      template.emailSupport(settings.name + ' caught error: ' + req.originalUrl, err.stack.toString());
    });
    app.listen(settings.serverPort, function () {
      console.log('EXPRESS: listening port ' + settings.serverPort);
      setTimeout(function () {
        var startRss = process.memoryUsage().rss;
        setInterval(function () {
          if (process.memoryUsage().rss - startRss > settings.allowedMemoryLeak) {
            setTimeout(function () {
              if (process.memoryUsage().rss - startRss > settings.allowedMemoryLeak) {
                console.error('GROWING MEMORY: from ', startRss / 1000000, 'to', process.memoryUsage().rss / 1000000);
                process.exit();
              }
            }, settings.checkMemoryLeakInterval / 2);
          }
        }, settings.checkMemoryLeakInterval / 2);
      }, 10000);
    });
  }
};
/*--EXPORTS----------------------------------------------------------------------------------*/
module.exports = template;