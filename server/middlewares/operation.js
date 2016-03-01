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
 *    operation : OPERATION,  ['get', 'create', 'active']
 *    model : MODEL,          ['scriptAcitve', 'scriptHistory', 'trigger']
 *    data : DATA             [according to operation and model]
 * }
 *
 */

var operates = {

    get_scriptActive : function(data, callback){
        Dao.readOneDoc("scriptConfActive", data, callback);
    },

    get_scriptHistory : function(data, callback){
        Dao.readDocById("scriptConfHistory", data.id, callback);
    },

    create_scriptHistory : function(data, callback){
        Dao.createDoc("scriptConfHistory", callback);
    },

    create_trigger : function(data, callback){
        Dao.createDoc("trigger", data, callback);
    },

    activate_scriptHistory : function(data, callback){
        Dao.scriptHistoryDao.getScriptHistoryWithTriggerById(data.id, function(error, scriptHistory){
            //not sure the implementation
        });
    },

    set_scriptActive : function(data, callback){

    }
}

/**
 *
 * @param operation should only be 'create', 'get', 'activate'
 * @param model should only be 'scriptConfActive'
 * @param data
 * @param callback
 * @private
 */
function _oper(operation, model, data, callback){
    operates[operation+"_" + model](data, callback);
}

function operation(req, res, next){
    var operationData = req.SsiData.SsiOperation;

    _oper(operationData.operation, operationData.model, operationData.data, function(error, ret){
        if(error){
            next(error);
        }else{
            req.SsiData.result = ret;
            next();
        }
    });
}

module.exports = operation;