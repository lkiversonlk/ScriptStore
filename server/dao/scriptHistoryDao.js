/**
 * Created by jerry on 2/29/16.
 */

var scriptHistory = require("../models").ScriptHistory;

scriptHistoryDao = {
    getScriptHistoryWithTriggerById : function(id, callback){
        scriptHistory.findById(id).populate("triggers").exec(callback);
    }
};

module.exports = scriptHistoryDao;