/**
 * Created by jerry on 3/15/16.
 */

var SsiErrors = require("../../errors");
var logger = require("../../log").getLogger("middlewares.operators.adapterOperators");
var  operators = {
    /**
     * data should be like {
     *    update : {}
     *    data :
     * }
     * update the data.data according to update value
     * @param data
     * @param context
     * @param callback
     */
    adapter_update_property : function(data, context, callback){
        if(data.query && data.data){
            var ret = data.data;
            Object.keys(data.query).forEach(function(key){
                ret[key] = data.query[key];
            });
            callback(null, ret);
        }else{
            logger.log("error", "update adapter needs data and update field");
            callback()
        }
    },

    adapter_extact_property : function(data, context, callback){

    }
};

module.exports = operators;