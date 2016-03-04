/**
 * Created by jerry on 3/4/16.
 */

var logger = require("../../log").getLogger("middlewares.operators");

var operatorJSList = [
    "DBOperators",
    "scriptOperators"
];

var ret = {

};

var OperatorError = function(msg){
    this.message = msg;
    Error.captureStackTrace(this, OperatorError);
};

ret.Error = OperatorError;

operatorJSList.forEach(function(operatorJS){
    var operators = require("./" + operatorJS);
    Object.keys(operators).forEach(function(operator){
        if(operators.hasOwnProperty(operator)){
            if(ret.hasOwnProperty(operator)){
                throw new OperatorError(operator);
            }
            logger.log("info", "add operator " + operator);
            ret[operator] = operators[operator];
        }
    })
});

module.exports = ret;