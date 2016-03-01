/**
 * Created by jerry on 2/29/16.
 */
var util = require("util");

var SsiError = function(code, msg){
    this.code = code;
    this.message = msg;
    Error.captureStackTrace(this, SsiError);
};

var errorLib = {
    SsiError : SsiError,

    ParameterInvalidError : function(msg){
        return new SsiError(2, msg);
    },


};

module.exports = errorLib;