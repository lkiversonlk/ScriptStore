/**
 * Created by jerry on 3/3/16.
 */

var winston = require("winston");

function Logger(module){
    this.module = module;
}

Logger.prototype.log = function(level, msg){
    var msg = new Date().toLocaleString() + ": " + "<" + this.module + ">" + ":::" + msg;
    winston.log(level, msg);
};

module.exports.getLogger = function(module){
    return new Logger(module)
};

module.exports.setLogLevel = function(level){
    winston.level = level;
}