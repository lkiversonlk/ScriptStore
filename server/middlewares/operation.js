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

/**********************************************
 * operation middleware
 *
 * this middleware assumes that data structure defined below are put in req.SsiData.SsiOperation
 * {
 *    operation : OPERATION,  ['getOne', 'getAll', 'create', 'active', 'debug']
 *    model : MODEL,          ['scriptAcitve', 'version', 'trigger']
 *    data : {
 *              query :
 *              select :
 *              populate :
 *              data :
 *              ...
*            }
 * }
 *
 */

var operates = {

    getOne_active : function(data, context, callback){
        Dao.readOneDoc("active", data, callback);
    },

    getAll_active : function(data, context, callback){
        Dao.readDoc("active", data, callback);
    },

    getOne_version : function(data, context, callback){
        Dao.readOneDoc("version", data, callback);
    },

    getAll_version : function(data, context, callback){
        Dao.readDoc("version", data, callback);
    },


    create_version : function(data, context, callback){
        //should check the triggers
        Dao.createDoc("version", data.data, callback);
    },

    getOne_trigger : function(data, context, callback){
        Dao.readOneDoc("trigger", data, callback);
    },

    getAll_trigger : function(data, context, callback){
        Dao.readDoc("trigger", data, callback);
    },

    create_trigger : function(data, context, callback){
        //
        Dao.createDoc("trigger", data.data, function(error, doc){
           if(error) {
               callback(error);
           } else{
               /*
               if(doc){
                   doc = doc.toJSON()
               }*/
               callback(null, doc);
           }
        });
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
    },

    debug_scriptHistory : function(data, callback){
        Dao.readOneDoc("version", data, function(error, scriptHistory){
           if(error){

           } else{
               var adid = scriptHistory.adid;
               var id = scriptHistory.id;

               //set cookie adid : adid , id
           }
        });
    }
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
    operates[operation+"_" + model](data, context, callback);
}

function operation(req, res, next){
    var operationData = req.SsiData;

    if(operationData.operation){
        _oper(operationData.operation, operationData.model, operationData.data, [req, res, next], function(error, ret){
            if(error){
                next(error);
            }else{
                req.SsiData.result = ret;
                return next();
            }
        });
    }else{
        logger.log("debug", "receive invalid path " + req.originalUrl);
        return next(SsiError.PathInvalidError(req.originalUrl));
    }
}

module.exports = operation;