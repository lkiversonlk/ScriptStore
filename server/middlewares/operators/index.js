/**
 * Created by jerry on 3/4/16.
 */

var logger = require("../../log").getLogger("middlewares.operators");

/**********************************************
 * Operators are the basic operations that can be chained together to complete a task
 *
 * every operator is a function:
 *
 * operator(data, context, callback)
 *
 * data are left by higher middlewares.
 * context is an array of  [req, res, next, results], req, res, next are from express, results are left by operators ahead in the operation chain
 *
 * *Cautions: do not change the results, if operator needs to pass result to next operator, just callback(null, result), it will be automatically added into the results chain
 *
 */
var operatorJSList = [
    "DBOperators",
    "scriptOperators",
    "adapterOperators"
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

module.exports.operators = ret;

var utils = require("./utils");
module.exports.utils = utils;