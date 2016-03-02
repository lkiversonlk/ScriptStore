/**
 * Created by jerry on 2/29/16.
 */

var scriptHistoryDao = require("./scriptHistoryDao");
var models = require("../models");

var Dao = {
    readDoc : function(resource, data){
        var query = models[resource].find(data.query);
        if(data.select){
            query.select(data.select.join(" "));
        }
        
    },

    readOneDoc : function(){

    },

    createDoc : function(){

    },

    deleteDoc : function(){

    },

    updateDoc : function(){

    }
};

module.exports = Dao;