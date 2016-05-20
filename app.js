var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var winston = require("winston");


var restRouter = require('./server/routes/rest');
var manage = require("./server/routes/manage");
var middlewares = require("./server/middlewares");
//var users = require('./routes/users');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// db connection
var configuration = null;
var configurationSchema = require("./configs/configSchema.json");
var yaml = require("js-yaml");
var fs = require("fs");

try{
    configuration = yaml.safeLoad(fs.readFileSync("./configs/config.yaml", "utf-8"));
}catch (error){
    console.log("fail to load configuration " + error.message);
    process.exit(-1);
}
/*
try{
    configuration = require("./configs/test.json");
    console.log("under test environment");
}catch (error){
    console.log("not under test environment");
}
*/


var jsen = require("jsen");

var validate= jsen(configurationSchema);
if(validate(configuration)){
    console.log("configuration validation passed");
    app.set("SsiConfiguration", configuration);

    if(configuration.app){
        if(configuration.app.log){
            if(configuration.app.log.level){
                winston.level = configuration.app.log.level;
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
var connectString = configuration.db.map(function(db){
    return db.connectString
}).join(",");

var options = {};
options.server = {};
options.replset = {};
options.server.socketOptions =
    options.replset.socketOptions =
    {keepAlive : 120};

mongoose.connect(connectString, options);

winston.add(require("winston-daily-rotate-file"),
    {
        filename: (path.join(".", "logs", "pyscript." + process.pid + ".")),
        level: configuration.app.log.level,
        datePattern: "yyyy-MM-dd.log",
        maxsize: 1024 * 1024 * 1024 * 1
    });

process.on('uncaughtException', function (err) {
    winston.log("error", err.stacktrace);
    process.exit(-1);
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var SsiData = require("./server/SsiData");

/**
 * disable Nagle algorithm to speed up traffic
 */

app.use(function(req, res, next){
    req.connection.setNoDelay(true);
    next();
});

require("http").globalAgent.maxSockets = Infinity;


app.get("/", function(req, res, next){
    res.render("index", {title : "Smart Pixel"});
});

app.use(function(req, res, next){
    req.SsiData = new SsiData();
    next();
});

var template = require("./server/routes/template");
app.use("/template", template, middlewares.presentation.present, middlewares.presentation.presentError);

app.use(middlewares.parameters);
app.use('/rest', restRouter);
app.use('/manage', manage);
app.use(middlewares.operation);
app.use(middlewares.presentation.present);
app.use(middlewares.presentation.presentError);

module.exports = app;
