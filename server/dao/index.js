/**
 * Created by jerry on 2/29/16.
 */

var models = require("../models");
var logger = require("../log").getLogger("dao");

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
        query.exec(callback);
    },

    readOneDoc : function (resource, data, callback){
        Dao.readDoc(resource, data, function(error, docs){
            if(error){
                callback(error);
            }else{
                if(docs.length != 1){
                    //TODO: if there are multiple docs?
                    callback(null, null);
                }else {
                    callback(null, docs[0]);
                }
            }
        });
    },

    createDoc : function(resource, data, callback){
        models[resource](data).save(callback);
    },

    deleteDoc : function(resource, data, callback){
        models[resource].remove(data.query, callback);
    },

    updateDoc : function(resource, data, callback){
        models[resource].update(data.query, data.data, callback);
    },

    updateOrInsertDoc : function(resource, data, callback){
        var options = {
            safe : true,
            upsert : true
        };

        delete data.data._id;

        models[resource].update(data.query, data.data, options, callback);
    }
};

module.exports = Dao;