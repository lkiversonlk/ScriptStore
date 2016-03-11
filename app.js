var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var restRouter = require('./server/routes/rest');
var manage = require("./server/routes/manage");
var middlewares = require("./server/middlewares");
//var users = require('./routes/users');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// db connection
var configuration = require("./configs/config.json");
var configurationSchema = require("./configs/configSchema.json");
var jsen = require("jsen");

var validate= jsen(configurationSchema);
if(validate(configuration)){
    console.log("configuration validation passed");
    app.set("SsiConfiguration", configuration);

    if(configuration.app){
        if(configuration.app.log){
            if(configuration.app.log.level){
                require("./server/log").setLogLevel(configuration.app.log.level);
            }
        }
    }
}else{
    console.log("configuration file invalid : ");
    validate.errors.forEach(function(error){
        console.log("path: " + error.path + " configuration error");
    });
    process.exit(-1);
}

var mongoose = require("mongoose");
mongoose.connect(configuration.db.connectString);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var SsiData = require("./server/SsiData");

app.get("/", function(req, res, next){
    res.render("index", {title : "Smart Pixel"});
});

app.use(function(req, res, next){
    req.SsiData = new SsiData();
    next();
});

app.use(middlewares.parameters);
app.use('/rest', restRouter);
app.use('/manage', manage);
//app.use('/users', users);

app.use(middlewares.operation);
app.use(middlewares.presentation.present);
app.use(middlewares.presentation.presentError);

module.exports = app;
