/**
 * Created by jerry on 3/7/16.
 */

var SsiError = require("../../errors");
var mongooseError = require("mongoose").Error;
var logger = require("../../log").getLogger("middlewares.operators.utils");

function _mongooseErrorHandler(error){
    if(!error) return error;
    if(error instanceof mongooseError){
        logger.log("debug", "mongoose error [" + error.name + " " + error.toString() + "]");
        return SsiError.DBOperationError(error.message);
    }else{
        logger.log("error", "unknown error [" + error.name + " " + error.message + "]");
        return SsiError.ServerError();
    }
}

function _wrapCallback(callback){
    return function (error, result){
        callback(_mongooseErrorHandler(error), result);
    }
}


var OperationBuilder = {
    GetDraft : function(adid){
        return {
            type : "script",
            operation : "get",
            model : "draft",
            data : {
                query : {
                    adid : adid
                }
            }
        };
    },

    DbGetOne : function(model, data){
        return {
            type : "db",
            operation : "getOne",
            model : model,
            data : data
        }
    },

    DbGetAll : function(model, data){
        return {
            type : "db",
            operation : "getAll",
            model : model,
            data : data
        }
    },

    DbCreate : function(model, data){
        return {
            type : "db",
            operation : "create",
            model : model,
            data : data
        }
    },

    DbUpdate : function(model, data){
        return {
            type : "db",
            operation : "update",
            model : model,
            data : data
        }
    },

    ScriptRelease : function(versionid){
        //TODO: test if async tasks supports dynamic add
        return {
            type : "script",
            operation : "release",
            model : "version"
        }
    },

    ScriptGetRelease : function(adid){
        return {
            type : "db",
            operation : "getOne",
            model : "release",
            data : {
                query : {
                    adid : "adid"
                }
            }
        }
    },

    ScriptCreateDraft : function(from, overwrite){
        var ret = [];
        if(overwrite){
            //save
            ret.push({
                type : "db",
                operation : "get"
            })
        }
    }
};

module.exports.mongooseWrapper = _mongooseErrorHandler;
module.exports.wrapCallback = _wrapCallback;
module.exports.operationBuilder = OperationBuilder;