/**
 * Created by jerry on 3/4/16.
 */

var Dao = require("../../dao");

var logger = require("../../log").getLogger("middlewares.operators.DBOperators");
var _wrapCallback = require("./utils").wrapCallback;



var operators = {
    db_getOne_active : function(data, context, callback){
        Dao.readOneDoc("active", data, _wrapCallback(callback));
    },

    db_getAll_active : function(data, context, callback){
        Dao.readDoc("active", data, _wrapCallback(callback));
    },

    db_getOne_version : function(data, context, callback){
        Dao.readOneDoc("version", data, _wrapCallback(callback));
    },

    db_getAll_version : function(data, context, callback){
        Dao.readDoc("version", data, _wrapCallback(callback));
    },

    db_update_version : function(data, context, callback){
        Dao.updateDoc("version", data, _wrapCallback(callback));
    },

    db_create_version : function(data, context, callback){
        //should check the triggers
        Dao.createDoc("version", data.data, _wrapCallback(callback));
    },

    db_release_version : function(data, context, callback){
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