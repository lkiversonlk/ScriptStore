/**
 * Created by jerry on 2/29/16.
 */
var async = require("async");
var Dao = require("../dao");
var OPERATION_KEY = "operation";
var MODEL_KEY = "model";
var DATA_KEY = "data";
var SsiError = require("../errors");
var logger = require("../log").getLogger("middlewares.operation");

try{
    var operators = require("./operators");
}catch(error){
    logger.log("error", "duplicate operators found [" + error.message + "]");
    process.exit(-1);
}

/**
 *
 * @param operation should only be 'create', 'getOne', 'getAll', 'debug', 'activate'
 * @param model should only be 'scriptConfActive'
 * @param data
 * @param callback
 * @private
 */
function _oper(operation, model, data, context, callback){
    //console.log(operation + ": " + model + ": " + JSON.stringify(data));
    //callback(null, "success");
    operators[operation+"_" + model](data, context, callback);
}

function operation(req, res, next){
    var operations = req.SsiData.operations;
    var ret = null;

    async.reduce(
        operations,
        [],
        function(results, operation, callback){
            if(operation.operation) {
                _oper(operation.operation, operation.model, operation.data, [req, res, next, results], function (error, result) {
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
                req.SsiData.result = results.length > 0 ? results[results.length - 1] : null;
                return next();
            }
        }
    );
}

module.exports = operation;