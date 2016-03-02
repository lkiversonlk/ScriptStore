/**
 * Created by jerry on 2/29/16.
 */

var models = require("../models");

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
                    callback(null, null);
                }else {
                    callback(null, docs[0]);
                }
            }
        });
    },

    createDoc : function(resource, data, callback){
        new models[resource](data).save(callback);
    },

    deleteDoc : function(resource, data, callback){

    },

    updateDoc : function(){

    }
};

module.exports = Dao;