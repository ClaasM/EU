var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var sendmail = require('./routes/sendmail');
var gplus = require('./routes/gplus');
var twitter = require('./routes/twitter');
var fb = require('./routes/fb');

var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(favicon(__dirname + '/public/media/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(require('prerender-node').set('prerenderToken', 'VZlNVlkyOi6eaTnm6w81'));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/sendmail', sendmail);
app.use('/gplus', gplus);
app.use('/twitter', twitter);
app.use('/fb', fb);

app.get('/*', function(req, res, next) {
    if (path.extname(req.path).length > 0) {
        // bad resource request
        next();
    } else {
        // Just send the index.html for other files to support HTML5Mode
        res.sendFile('public/index.html', { root: __dirname });
    }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
} else {
// production error handler
// no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
}

module.exports = app;
