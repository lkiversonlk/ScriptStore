/**
 * Created by jerry on 2/29/16.
 */
var async = require("async");
var Dao = require("../dao");
var SsiError = require("../errors");
var logger = require("../log").getLogger("middlewares.operation");

try{
    var operators = require("./operators").operators;
}catch(error){
    logger.log("error", "duplicate operators found [" + error.message + "]");
    process.exit(-1);
}

/**
 * will call operation_model in sync sequence
 * @param operation
 * @param model
 * @param data
 * @param callback
 * @private
 */
function _oper(type, operation, model, data, context, callback){
    //console.log(operation + ": " + model + ": " + JSON.stringify(data));
    //callback(null, "success");
    var method = type + "_" + operation+"_" + model;
    if(operators[method] !== undefined){
        logger.log("debug", "calling operation " + method);
        operators[method](data, context, callback);
    }else{
        logger.log("error", "no method for " + method);
        callback(SsiError.ServerError());
    }
}

function operation(req, res, next){
    var operations = req.SsiData.operations;
    var ret = null;

    if(operations.length == 0){
        return next(SsiError.PathInvalidError(req.originalUrl + " is invalid"));
    }
    async.reduce(
        operations,
        [],
        function(results, operation, callback){
            if(operation.operation) {
                var data = operation.data;
                if(data.data == null){
                    data.data = results.length ? results[results.length - 1] : null;
                }

                _oper(operation.type, operation.operation, operation.model, data, [req, res, next, results], function (error, result) {
                    if (error) {
                        callback(error);
                    } else {
                        results.push(result);
                        callback(null, results);
                    }
                });
            }else{
                logger.log("debug", "receive invalid path " + req.originalUrl);
                callback(SsiError.PathInvalidError(req.originalUrl));
            }
        },

        function(error, results){
            if(error){
                return next(error);
            }else{
                req.SsiData.result = results[results.length - 1];
                return next();
            }
        }
    );
}

module.exports = operation;