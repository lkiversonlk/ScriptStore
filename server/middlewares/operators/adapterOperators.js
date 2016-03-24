/**
 * Created by jerry on 3/15/16.
 */

var SsiErrors = require("../../errors");
var logger = require("../../log").getLogger("middlewares.operators.adapterOperators");
var  operators = {
    /**
     * data should be like {
     *    query : { key : value}
     *    data : obj
     * }
     * update obj[key]=value
     *
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
            callback(SsiErrors.DataInvalidError("update adapter needs data and query field"));
        }
    }
};

module.exports = operators;