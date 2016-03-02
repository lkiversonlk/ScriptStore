var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var errorHandler = require("./server/middlewares").presentation.presentError;

var scriptRouter = require('./server/routes/script');
//var users = require('./routes/users');


var app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

// db connection
var configuration = require("./configs/config.json");
var configurationSchema = require("./configs/configSchema.json");
var jsen = require("jsen");

var validate= jsen(configurationSchema);
if(validate(configuration)){
    console.log("configuration validation passed");
    app.set("SsiConfiguration", configuration);
}else{
    console.log("configuration file invalid : ");
    validate.errors.forEach(function(error){
        console.log("path: " + error.path + " configuration error");
    });
    process.exit(-1);
}

var mongoose = require("mongoose");
//mongoose.connect()

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
    req.SsiData = {};
    next();
});

app.use('/script', scriptRouter);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
app.use(errorHandler);

module.exports = app;
