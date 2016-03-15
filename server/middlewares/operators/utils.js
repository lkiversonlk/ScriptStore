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
        if(result && result.toJSON){
            result = result.toJSON();
        }
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
            ret = ret.concat(OperationBuilder.saveDraftToVersion({query : {adid : adid}}));
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

        ret = ret.concat(OperationBuilder.DbGetOne("version", data));
        ret = ret.concat(OperationBuilder.getReleasedContent());
        //since data.data may be fullfilled by the operation, so we extract the query alone
        ret = ret.concat(OperationBuilder.DbUpdateOrInsert("release", {query : {adid : data.query.adid }, data : null}));
        ret = ret.concat(OperationBuilder.DbUpdate("version", {query : data.query, data : {publish : Date.now()}}));
        //ret.push(OperationBuilder.DbUpdate("version", { query : data.query, data : { publish : Date.now()}}));
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
        ret.push({
            type : "adapter",
            operation : "update",
            model : "property",
            data : {
                update : {
                    publish : Date.now()
                },
                data : null
            }
        });
        ret = ret.concat(OperationBuilder.DbCreate("version", {data : null}));
        ret = ret.concat(OperationBuilder.getReleasedContent());
        //since data.data may be fullfilled by the operation, so we extract the query alone
        ret = ret.concat(OperationBuilder.DbUpdateOrInsert("release", {query : query, data : null}));
        return ret;
    },

    /**
     *
     * @param data
     */
    debugDraft : function(data){
        return [
            {
                type : "script",
                operation : "set",
                model : "cookie",
                data : {
                    query : data.query,
                    data : {
                        debug : true,
                        type : "draft"
                    }
                }
            }
        ];
    },

    /**
     *
     * @param data
     */
    debugVersion : function(data){
        var adid = data.query.adid;
        var versionId = data.query._id;

        return [
            {
                type : "script",
                operation : "set",
                model : "cookie",
                data : {
                    query : data.query,
                    data : {
                        debug : true,
                        type : "version",
                        id : versionId
                    }
                }
            }
        ];
    },

    /**
     *
     * @param data
     */
    undebug : function(data){
        return [
            {
                type : "script",
                operation : "set",
                model : "cookie",
                data : {
                    query : data.query,
                    data : {
                        debug : false
                    }
                }
            }
        ]
    }
};

/**
 * validate that version tags' trigger indexes.
 * @param data
 */
function validateVersion(data, isRelease){
    try{
        var tagNames = {};
        var triggerNames = {};
        var triggers = data.triggers ? data.triggers : [];

        if(!isRelease){
            triggers.forEach(function(trigger){
                if(triggerNames.hasOwnProperty(trigger.name)){
                    throw new Error("trigger name " + trigger.name + " conflict");
                }
                triggerNames[trigger.name] = true;
            });
        }

        var tags = data.tags ? data.tags : [];
        tags.forEach(function(tag, tagIndex){
            if(!isRelease && tagNames.hasOwnProperty(tag.name)){
                throw new Error("tag name " + tag.name + " conflict");
            }
            tagNames[tag.name] = true;
            tag.triggers.forEach(function(triggerIndex){
                if(triggerIndex <0 || triggerIndex >= triggers.length){
                    throw new Error("tag." + tagIndex + " has invalid trigger " + triggerIndex);
                }
            });
        });
    }catch(error){
        return [false, error.message];
    }

    return [true, null];
}

module.exports.mongooseWrapper = _mongooseErrorHandler;
module.exports.wrapCallback = _wrapCallback;
module.exports.operationBuilder = OperationBuilder;
module.exports.validateVersion = validateVersion;