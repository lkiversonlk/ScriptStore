/**
 * Created by jerry on 3/7/16.
 */

var SsiError = require("../../errors");
var mongooseError = require("mongoose").Error;
var logger = require("../../log").getLogger("middlewares.operators.utils");
var extend = require("util")._extend;

function _mongooseErrorHandler(error){
    if(!error) return error;
    if(error instanceof mongooseError){
        logger.log("debug", "mongoose error [" + error.name + " " + error.toString() + "]");
        return SsiError.DBOperationError(error.message);
    }else{
        logger.log("error", "unknown error [" + error.name + " " + error.message + "]");
        return SsiError.ServerError();
    }
}

function _wrapCallback(callback){
    return function (error, result){
        callback(_mongooseErrorHandler(error), result);
    }
}


var OperationBuilder = {
    //directly db operation
    DbGetOne : function(model, data){
        return [{
            type : "db",
            operation : "getOne",
            model : model,
            data : data
        }];
    },

    DbGetAll : function(model, data){
        return [{
            type : "db",
            operation : "getAll",
            model : model,
            data : data
        }];
    },

    DbCreate : function(model, data){
        return [{
            type : "db",
            operation : "create",
            model : model,
            data : data
        }];
    },

    DbUpdate : function(model, data){
        return [{
            type : "db",
            operation : "update",
            model : model,
            data : data
        }];
    },

    DbDelete : function(model, data){
        return [{
            type : "db",
            operation : "delete",
            model : model,
            data : data
        }];
    },

    DbUpdateOrInsert : function(model, data){
        return [{
            type : "db",
            operation : "updateOrInsert",
            model : model,
            data : data
        }]
    },
    /**
     * check out specified version and update it to current draft
     * @param from
     * @returns {Array}
     */
    checkOutVersionToDraft : function(adid, versionId){
        var ret = [];
        ret = ret.concat(OperationBuilder.DbGetOne("version", {query : {_id : versionId}}));
        ret = ret.concat(OperationBuilder.DbUpdate("draft", {query : {adid : adid}, data : null}));
        return ret;
    },

    /**
     * create empty draft for adid
     * @param adid
     * @returns {Array}
     */
    createEmptyDraft : function(adid){
        ret = [];
        ret = ret.concat(OperationBuilder.DbDelete("draft", { query : {adid : adid}}));
        var emptyDraft = {
            adid : adid
        };
        ret = ret.concat(OperationBuilder.DbCreate("draft", { data : emptyDraft}));
        return ret;
    },

    /**
     * if not overwrite, publish current draft to a new version
     * create a new empty draft if version is not provided, or copy the specified version to be a new draft
     * @param adid
     * @param version
     * @param overwrite
     * @returns {Array}
     */

    exportVersionToDraft : function(adid, version, overwrite){
        var ret = [];
        if(!overwrite){
            ret = ret.concat(OperationBuilder.saveDraftToVersion({adid : adid}));
        }
        if(version){
            ret = ret.concat(OperationBuilder.checkOutVersionToDraft(adid, version))
        }else{
            ret = ret.concat(OperationBuilder.createEmptyDraft(adid));
        }
        return ret;
    },

    /**
     * save current draft to a new version
     * @param draftId
     * @returns {Array}
     */
    saveDraftToVersion : function(data){
        var ret = [];
        ret = ret.concat(OperationBuilder.DbGetOne("draft", data));
        ret = ret.concat(OperationBuilder.DbCreate("version", { data : null}));
        return ret;
    },

    /**
     * release specified version
     * @param adid
     * @param versionId
     * @returns {*[]}
     */
    releaseVersion : function(adid, versionId){
        return [{
            type : "script",
            operation : "release",
            model : "version",
            data : {
                _id : versionId
            }
        }];
    },

    /**
     * return all the versions and draft according to data.query
     * @param data
     * @returns {*[]}
     */
    getConfigurations : function(data){
        return [{
            type : "script",
            operation : "get",
            model : "configurations",
            data : data
        }];
    },

    getReleasedContent : function(data){
        if(!data) {
            data = {};
        }
        data.data = null;
        return [{
            type : "script",
            operation : "transform",
            model : "version",
            data : data
        }]
    },

    /**
     *
     * @param data
     * @returns {Array}
     */
    publishVersion : function(data){
        var ret = [];
        var query = data.query;
        ret = ret.concat(OperationBuilder.DbGetOne("version", data));
        ret = ret.concat(OperationBuilder.getReleasedContent());
        //since data.data may be fullfilled by the operation, so we extract the query alone
        ret = ret.concat(OperationBuilder.DbUpdateOrInsert("release", {query : query, data : null}));
        return ret;
    },

    /**
     *
     * @param data
     * @returns {Array}
     */
    publishDraft : function(data){
        var ret = [];
        var query = data.query;
        ret = ret.concat(OperationBuilder.DbGetOne("draft", data));
        ret = ret.concat(OperationBuilder.DbCreate("version", {data : null}));
        ret = ret.concat(OperationBuilder.getReleasedContent());
        ret = ret.concat(OperationBuilder.DbUpdateOrInsert("release", {query : query, data : null}));
        return ret;
    }
};

module.exports.mongooseWrapper = _mongooseErrorHandler;
module.exports.wrapCallback = _wrapCallback;
module.exports.operationBuilder = OperationBuilder;
