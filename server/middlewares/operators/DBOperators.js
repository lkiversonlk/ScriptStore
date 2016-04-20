/**
 * Created by jerry on 3/4/16.
 */

var Dao = require("../../dao");
var logger = require("../../log").getLogger("middlewares.operators.DBOperators");
var _wrapCallback = require("./utils").wrapCallback;
var SsiErrors = require("../../errors");
var validateVersion = require("./utils").validateVersion;
var TimeCache = require("../../timeCache");

var releaseCache = new TimeCache(10 * 60 * 1000);

var operators = {
    db_getAll_draft : function(data, context, callback){
        Dao.readDoc("draft", data, _wrapCallback(callback));
    },


    db_getOne_release : function(data, context, callback){
        //add cache here
        //assume that the only parameter should be advid
        if(data && (data.query) && (data.query.advid)){
            return releaseCache.get(data.query.advid)
                .then(
                    function (item) {
                        logger.log("debug", "cache hitted for advid " + data.query.advid);
                        callback(null, item);
                    },
                    function () {
                        Dao.readOneDoc("release", data, _wrapCallback(function (error, doc) {
                            if(error){
                                callback(error);
                            }else{
                                logger.log("debug", "cache missed for advid " + data.query.advid);
                                releaseCache.set(data.query.advid, doc);
                                callback(null, doc);
                            }
                        }));
                    }
                )
        }else{
            Dao.readOneDoc("release", data, _wrapCallback(callback));
        }

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

    db_update_version : function(data, context, callback){
        data.data.creation = Date.now();
        Dao.updateDoc("version", data, _wrapCallback(callback));
    },

    db_create_version : function(data, context, callback){
        delete data.data._id;
        var result = validateVersion(data.data);
        if(!result[0]){
            return callback(SsiErrors.DataInvalidError(result[1]));
        }
        data.data.creation = Date.now();
        Dao.createDoc("version", data.data, _wrapCallback(callback));
    },

    db_getOne_draft : function(data, context, callback){
        Dao.readOneDoc("draft", data, _wrapCallback(callback));
    },

    db_delete_draft : function(data, context, callback){
        Dao.deleteDoc("draft", data, _wrapCallback(callback));
    },

    db_update_draft : function(data, context, callback){
        delete data.data._id;
        var result = validateVersion(data.data);
        if(!result[0]){
            return callback(SsiErrors.DataInvalidError(result[1]));
        }
        data.data.creation = Date.now();
        Dao.updateDoc("draft", data, _wrapCallback(callback));
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
        var result = validateVersion(data.data, true);
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