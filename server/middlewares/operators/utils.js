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

function OperationData(type, operation, model, data){
    this.type = type;
    this.operation = operation;
    this.model = model;
    this.data = data
};

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
        return [new OperationData("db", "getOne", model, data)];
    },

    DbGetAll : function(model, data){
        return [new OperationData("db", "getAll", model, data)];
    },

    DbCreate : function(model, data){
        return [new OperationData("db", "create", model, data)];
    },

    DbUpdate : function(model, data){
        return [new OperationData("db", "update", model, data)];
    },

    DbDelete : function(model, data){
        return [new OperationData("db", "delete", model, data)];
    },

    DbUpdateOrInsert : function(model, data){
        return [new OperationData("db", "updateOrInsert", model, data)];
    },
    /**
     * check out specified version and update it to current draft
     * @param from
     * @returns {Array}
     */
    checkOutVersionToDraft : function(advid, versionId){
        var ret = OperationBuilder.DbGetOne("version", {query : {_id : versionId}});
        ret = ret.concat(OperationBuilder.DbUpdate("draft", {query : {advid : advid}, data : null}));
        return ret;
    },

    /**
     * create empty draft for advid
     * @param advid
     * @returns {Array}
     */
    createEmptyDraft : function(advid){
        var ret = OperationBuilder.DbDelete("draft", { query : {advid : advid}});
        ret = ret.concat(OperationBuilder.DbCreate("draft", { data : {advid : advid}}));
        return ret;
    },

    /**
     * if not overwrite, publish current draft to a new version
     * create a new empty draft if version is not provided, or copy the specified version to be a new draft
     * @param advid
     * @param version
     * @param overwrite
     * @returns {Array}
     */

    exportVersionToDraft : function(advid, version, overwrite){
        var ret = [];
        if(!overwrite){
            ret = ret.concat(OperationBuilder.saveDraftToVersion({query : {advid : advid}}));
        }
        if(version){
            ret = ret.concat(OperationBuilder.checkOutVersionToDraft(advid, version))
        }else{
            ret = ret.concat(OperationBuilder.createEmptyDraft(advid));
        }
        return ret;
    },

    /**
     * save current draft to a new version
     * @param draftId
     * @returns {Array}
     */
    saveDraftToVersion : function(data){
        var ret = OperationBuilder.DbGetOne("draft", data);
        ret = ret.concat(OperationBuilder.DbCreate("version", { data : null}));
        return ret;
    },

    /**
     * release specified version
     * @param advid
     * @param versionId
     * @returns {*[]}
     */
    releaseVersion : function(advid, versionId){
        return [new OperationData("script", "release", "version", {_id : versionId})];
    },

    /**
     * return all the versions and draft according to data.query
     * @param data
     * @returns {*[]}
     */
    getConfigurations : function(data){
        return [new OperationData("script", "get", "all", data)];
    },

    getReleasedContent : function(data){
        return [new OperationData("script", "transform", "version", data)];
    },

    /**
     *
     * @param data
     * @returns {Array}
     */
    publishVersion : function(data){
        var ret = OperationBuilder.DbGetOne("version", data);
        ret = ret.concat(OperationBuilder.getReleasedContent({data : null}));
        //since data.data may be fullfilled by the operation, so we extract the query alone
        ret = ret.concat(OperationBuilder.DbUpdateOrInsert("release", {query : {advid : data.query.advid }, data : null}));
        ret = ret.concat(OperationBuilder.DbUpdate("version", {query : data.query, data : {publish : Date.now()}}));
        return ret;
    },

    /**
     *
     * @param data
     * @returns {Array}
     */
    publishDraft : function(data){
        var query = data.query;
        var ret = OperationBuilder.DbGetOne("draft", data);
        ret.push(
            new OperationData(
                "adapter",
                "update",
                "property",
                {
                    query : {
                        publish : Date.now()
                    },
                    data : null
                }
            )
        );
        ret = ret.concat(OperationBuilder.DbCreate("version", {data : null}));
        ret = ret.concat(OperationBuilder.getReleasedContent({data : null}));
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
            new OperationData(
                "script",
                "set",
                "cookie",
                {
                    query : data.query,
                    data : ""
                }
            )
        ];
    },

    /**
     *
     * @param data
     */
    debugVersion : function(data){
        var advid = data.query.advid;
        var versionId = data.query._id;
        return [new OperationData("script", "set", "cookie", {query : data.query, data : versionId})];
    },

    /**
     *
     * @param data
     */
    undebug : function(data){
        return [new OperationData("script", "delete", "cookie", {
            query : data.query,
            data : {}
        })];
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