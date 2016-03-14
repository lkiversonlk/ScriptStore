/**
 * Created by jerry on 3/4/16.
 */

var Dao = require("../../dao");
var logger = require("../../log").getLogger("middlewares.operators.DBOperators");
var _wrapCallback = require("./utils").wrapCallback;
var SsiErrors = require("../../errors");
var validateVersion = require("./utils").validateVersion;
var operators = {

    db_getAll_draft : function(data, context, callback){
        Dao.readDoc("draft", data, _wrapCallback(callback));
    },

    db_getOne_release : function(data, context, callback){
        Dao.readOneDoc("release", data, _wrapCallback(callback));
    },

    db_getAll_release : function(data, context, callback){
        Dao.readDoc("release", data, _wrapCallback(callback));
    },

    db_getOne_version : function(data, context, callback){
        Dao.readOneDoc("version", data, _wrapCallback(callback));
    },

    db_getAll_version : function(data, context, callback){
        Dao.readDoc("version", data, _wrapCallback(callback));
    },

    db_delete_version : function(data, context, callback){
        Dao.deleteDoc("version", data, _wrapCallback(callback));
    },

    /*
    db_update_version : function(data, context, callback){
        data.data.creation = Date.now();
        Dao.updateDoc("version", data, _wrapCallback(callback));
    },
    */

    db_create_version : function(data, context, callback){
        if(data.data){
            if(data.data.toJSON){
                data.data = data.data.toJSON();
            }
            delete data.data._id;
            var result = validateVersion(data.data);
            if(!result[0]){
                return callback(SsiErrors.DataInvalidError(result[1]));
            }
            data.data.creation = Date.now();
            Dao.createDoc("version", data.data, _wrapCallback(callback));
        }else {
            logger.log("error", "create version without data, maybe deleted by someone else at the same time");
            callback(SsiErrors.ServerError());
        }
    },

    db_getOne_draft : function(data, context, callback){
        Dao.readOneDoc("draft", data, _wrapCallback(callback));
    },

    db_delete_draft : function(data, context, callback){
        Dao.deleteDoc("draft", data, _wrapCallback(callback));
    },

    db_update_draft : function(data, context, callback){
        if(data.data){
            if(data.data.toJSON){
                data.data = data.data.toJSON();
            }
            delete data.data._id;
            var result = validateVersion(data.data);
            if(!result[0]){
                return callback(SsiErrors.DataInvalidError(result[1]));
            }
            data.data.creation = Date.now();
            Dao.updateDoc("draft", data, _wrapCallback(callback));
        }else {
            logger.log("warning", "update draft without data, maybe deleted by someone else at the same time");
            callback(SsiErrors.ServerError());
        }
    },

    db_create_draft : function(data, context, callback){
        delete data.data._id;
        var result = validateVersion(data.data);
        if(!result[0]){
            return callback(SsiErrors.DataInvalidError(result[1]));
        }
        data.data.creation = Date.now();
        Dao.createDoc("draft", data.data, _wrapCallback(callback));
    },

    db_updateOrInsert_release : function(data, context, callback){
        delete data.data._id;
        var result = validateVersion(data.data);
        if(!result[0]){
            return callback(SsiErrors.DataInvalidError(result[1]));
        }
        data.data.creation = Date.now();

        Dao.updateOrInsertDoc("release", data,  _wrapCallback(callback));
    },

    db_delete_release : function(data, context, callback){
        Dao.deleteDoc("release", data, _wrapCallback(callback));
    }
};

module.exports = operators;