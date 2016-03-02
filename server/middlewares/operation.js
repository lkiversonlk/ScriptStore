/**
 * Created by jerry on 2/29/16.
 */
var async = require("async");
var Dao = require("../dao");
var generateScript = require("./scriptGenerator");
var OPERATION_KEY = "operation";
var MODEL_KEY = "model";
var DATA_KEY = "data";

/**********************************************
 * operation middleware
 *
 * this middleware assumes that data structure defined below are put in req.SsiData.SsiOperation
 * {
 *    operation : OPERATION,  ['getOne', 'getAll', 'create', 'active', 'debug']
 *    model : MODEL,          ['scriptAcitve', 'scriptHistory', 'trigger']
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

    getOne_scriptActive : function(data, context, callback){
        Dao.readOneDoc("scriptActive", data, callback);
    },

    getAll_scriptActive : function(data, context, callback){
        Dao.readDoc("scriptActive", data, callback);
    },

    getOne_scriptHistory : function(data, context, callback){
        Dao.readOneDoc("scriptHistory", data, callback);
    },

    getAll_scriptHistory : function(data, context, callback){
        Dao.readDoc("scriptHistory", data, callback);
    },


    create_scriptHistory : function(data, context, callback){
        //should check the triggers
        Dao.createDoc("scriptHistory", data.data, callback);
    },

    create_trigger : function(data, context, callback){
        //
        Dao.createDoc("trigger", data.data, callback);
    },

    activate_scriptHistory : function(data, context, callback){
        var scriptHistoryId = data.query.id;
        Dao.readOneDoc("scriptHistory", { query : { id : scriptHistoryId}}, function(error, doc){
            if(error){

            }else{
                Dao.updateDoc("scriptActive",
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
        Dao.readOneDoc("scriptHistory", data, function(error, scriptHistory){
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

    _oper(operationData.operation, operationData.model, operationData.data, [req, res, next], function(error, ret){
        if(error){
            next(error);
        }else{
            req.SsiData.result = ret;
            next();
        }
    });
}

module.exports = operation;