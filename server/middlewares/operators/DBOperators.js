/**
 * Created by jerry on 3/4/16.
 */

var Dao = require("../../dao");
var mongooseError = require("mongoose").Error;
var logger = require("../../log").getLogger("middlewares.operators.DBOperators");
var SsiError = require("../../errors");

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

var operators = {
    getOne_active : function(data, context, callback){
        Dao.readOneDoc("active", data, _wrapCallback(callback));
    },

    getAll_active : function(data, context, callback){
        Dao.readDoc("active", data, _wrapCallback(callback));
    },

    getOne_version : function(data, context, callback){
        Dao.readOneDoc("version", data, _wrapCallback(callback));
    },

    getAll_version : function(data, context, callback){
        Dao.readDoc("version", data, _wrapCallback(callback));
    },

    update_version : function(data, context, callback){
        Dao.updateDoc("version", data, _wrapCallback(callback));
    },

    create_version : function(data, context, callback){
        //should check the triggers
        Dao.createDoc("version", data.data, _wrapCallback(callback));
    },

    release_version : function(data, context, callback){
        var vid = data.query._id;
        Dao.readOneDoc("version", data.query, function(error, doc){
            if(error){
                callback(error);
            }else{
                Dao.updateDoc("active",
                    {
                        query : { adid : doc.adid},
                        data : doc
                    },

                    function(error, result){

                    }
                );
            }
        });
    }
};

module.exports = operators;