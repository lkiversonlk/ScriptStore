/**
 * Created by jerry on 2/29/16.
 */
var async = require("async");
var Dao = require("./dao");
var generateScript = require("./scriptGenerator");
var OPERRATION_DATA_KEY = "SSiOperation";
var OPERATION_KEY = "operation";
var MODEL_KEY = "model";
var DATA_KEY = "data";

var operates = {
    get_scriptConfActive : function(data, callback){
        Dao.readDocByProperty("scriptConfActive", "adid", data.adid, callback);
    },

    get_scriptConfHistory : function(data, callback){
        Dao.readDocById("scriptConfHistory", data.id, callback);
    },

    create_scriptHistory : function(data, callback){
        Dao.createDoc("scriptConfHistory", callback);
    },

    create_trigger : function(data, callback){

    },

    activate_scriptHistory : function(data, callback){
        Dao.scriptHistoryDao.getScriptHistoryWithTriggerById(data.id, function(error, scriptHistory){
            if(error){
                callback(error);
            }else{
                var script = generateScript(scriptHistory.scripts);
                if(script == null){
                    callback(new Error("can't generate script"));
                }else{
                    var scriptActive = {
                        adid : scriptHistory.adid,
                        hid : scriptHistory.id,
                        creation : Date.now(),
                        description : data.description,
                        createBy : data.createBy,
                        script : script
                    };
                    operates.set_scriptActive(scriptActive, function(error){

                    });
                }
            }
        });
    },

    set_scriptActive : function(data, callback){
        Dao.
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
    var operationData = ssiData[OPERRATION_DATA_KEY];

    _oper(operationData[OPERATION_KEY], operationData[MODEL_KEY], operationData[DATA_KEY], function(error, ret){
        if(error){
            next(error);
        }else{

        }
    });
}

module.exports = operation;