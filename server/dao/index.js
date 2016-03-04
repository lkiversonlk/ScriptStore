/**
 * Created by jerry on 2/29/16.
 */

var models = require("../models");
var mongooseError = require("mongoose").Error;
var SsiError = require("../errors");
var logger = require("../log").getLogger("dao");

function _mongooseErrorHandler(error){
    if(!error || error instanceof SsiError.SsiError) return error;
    if(error instanceof mongooseError){
        logger.log("error", "mongoose error> " + error.name + ">" + error.message);
        return SsiError.DBOperationError(error.message);
    }else{
        logger.log("error", "unknown error> " + error.name + ">" + error.message);
        return SsiError.ServerError();
    }
}

var Dao = {
    readDoc : function(resource, data, callback){
        var query = models[resource].find(data.query);
        if(data.select){
            query.select(data.select.join(" "));
        }
        if(data.populate){
            data.populate.forEach(function(property){
                query.populate(property);
            });
        }
        query.exec(function(error, result){
            callback(_mongooseErrorHandler(error), result);
        });
    },

    readOneDoc : function (resource, data, callback){
        Dao.readDoc(resource, data, function(error, docs){
            if(error){
                callback(_mongooseErrorHandler(error));
            }else{
                if(docs.length != 1){
                    callback(null, null);
                }else {
                    callback(null, docs[0]);
                }
            }
        });
    },

    createDoc : function(resource, data, callback){
        models[resource](data).save(function(error, doc){
            callback(_mongooseErrorHandler(error), doc);
        });
    },

    deleteDoc : function(resource, data, callback){

    },

    updateDoc : function(){

    },

    updateOrInsertDoc : function(resource, query, updates, callback){
        var options = {
            safe : true,
            upsert : true
        };

        delete updates._id;

        models[resource].update(query, updates, options, function(error, result){
            callback(_mongooseErrorHandler(error), result);
        });
    }
};

module.exports = Dao;