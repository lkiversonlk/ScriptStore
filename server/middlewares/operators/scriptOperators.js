/**
 * Created by jerry on 3/4/16.
 */

var Dao = require("../../dao");

var _wrapCallback = require("./utils").wrapCallback;

var ret = {};

ret.script_draft = function(data, callback){
    Dao.readOneDoc("draft", data, _wrapCallback(callback));
};

ret.script_release = function(versionid, callback){

}

module.exports = ret;