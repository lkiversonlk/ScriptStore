/**
 * Created by jerry on 2/29/16.
 */

var scriptHistoryDao = require("./scriptHistoryDao");
var models = require("../models");

var Dao = {
    readDocById : function(model, id, callback){
        models[model].findById(id, callback);
    },

    readOneDoc : function(model, query, callback){
        models[model].findOne(query, callback);
    },

    createDoc : function(model, callback){

    },

    createOrUpdateDoc : function(model, query, doc, callback){
        models[model].findOneAndUpdate(query, doc, { upsert : true }, callback);
    },

    scriptHistoryDao : scriptHistoryDao
};

module.exports = Dao;