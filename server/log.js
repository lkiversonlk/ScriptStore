/**
 * Created by jerry on 3/3/16.
 */

var winston = require("winston");

function Logger(module){
    this.module = module;
}

Logger.prototype.log = function(level, msg){
    var msg = Date.now().toLocaleString() + ": " + "<" + this.module + ">" + ":::" + msg;
    winston.log(level, msg);
};

module.exports.getLogger = function(module){
    return new Logger(module)
};