/**
 * Created by jerry on 3/4/16.
 */

var Dao = require("../../dao");
var logger = require("../../log").getLogger("middlewares.operators.DBOperators");
var _wrapCallback = require("./utils").wrapCallback;

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
        //TODO:check the trigger validate
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
        Dao.updateDoc("draft", data, _wrapCallback(callback));
    },

    db_create_draft : function(data, context, callback){
        //TODO:check the trigger validate
        data.data.creation = Date.now();
        Dao.createDoc("draft", data.data, _wrapCallback(callback));
    },

    db_updateOrInsert_release : function(data, context, callback){
        Dao.updateOrInsertDoc("release", data,  _wrapCallback(callback));
    },
};

module.exports = operators;