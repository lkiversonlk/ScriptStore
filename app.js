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

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// db connection
var configuration = null;
var configurationSchema = require("./configs/configSchema.json");
var yaml = require("js-yaml");
var fs = require("fs");
require("http").globalAgent.maxSockets = Infinity;

try{
    configuration = yaml.safeLoad(fs.readFileSync("./configs/config.yaml", "utf-8"));
}catch (error){
    console.log("fail to load configuration " + error.message);
    process.exit(-1);
}

var jsen = require("jsen");
var validate= jsen(configurationSchema);
if(validate(configuration)){
    app.set("SsiConfiguration", configuration);
    winston.level = configuration.app.log.level;
}else{
    console.log("configuration file invalid : ");
    validate.errors.forEach(function(error){
        console.log("path: " + error.path + " configuration error");
    });
    process.exit(-1);
}

var mongoose = require("mongoose");
var connectString = configuration.db.join(",");

var options = {
    server : {
        socketOptions : {
            keepAlive : 50
        }
    },
    replset : {
        socketOptions : {
            keepAlive : 50
        }
    }
};

mongoose.connect(connectString, options);

winston.add(require("winston-daily-rotate-file"),
    {
        filename: (path.join(".", "logs", "pyscript." + process.pid + ".")),
        level: configuration.app.log.level,
        datePattern: "yyyy-MM-dd.log",
        maxsize: 1024 * 1024 * 1024 * 1
    });

/*
process.on('uncaughtException', function (err) {
    winston.log("error", err.stacktrace);
    process.exit(-1);
});
*/
var onFinished = require("on-finished");
var conLimit = configuration.app.concurrency;
var concurrency = 0;

app.use(function (req, res, next) {
    if(concurrency > conLimit){
        return res.sendStatus(404);
    }
    concurrency ++;
    onFinished(res, function (err, res) {
        concurrency --;
    });
    return next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
var SsiData = require("./server/SsiData");

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

var operationStack = express.Router();
operationStack.use(middlewares.operation, middlewares.presentation.present);

app.use('/rest', restRouter, operationStack);
app.use('/manage', manage, operationStack);
app.use(express.static(path.join(__dirname, 'public')));
app.use(middlewares.presentation.presentError);

module.exports = app;
