/**
 * Created by jerry on 3/7/16.
 */

var SsiError = require("../../errors");
var mongooseError = require("mongoose").Error;
var logger = require("../../log").getLogger("middlewares.operators.utils");

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

function _transformOriginToRelease(result){
    var triggers = result.triggers;
    delete result.triggers;
    delete result.deleted;
    delete result.description;
    delete result.name;
    delete result.creation;

    var originTags = result.tags;
    result.tags = [];

    originTags.forEach(function(tag){
        if(tag.deleted){

        }else{
            delete tag.deleted;
            var originTagTrigger = tag.triggers;
            tag.triggers = [];
            originTagTrigger.forEach(function(index){
                tag.triggers.push(triggers[index]);
            });
        }
    });
    return result;
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
            data : data? data.data : null
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

    scriptGetRelease : function(adid){
        return [{
            type : "db",
            operation : "getOne",
            model : "release",
            data : {
                query : {
                    adid : "adid"
                }
            }
        }];
    },

    /**
     *
     * @param version
     * @returns {Array}
     */
    getVersion : function(version){
        var ret = [];
        ret.push({
            type : "db",
            operation : "getOne",
            model : "version",
            data : {
                query : {
                    _id : version
                }
            }
        });
        return ret;
    },

    /**
     * check out specified version to current draft
     * @param from
     * @returns {Array}
     */
    checkOutVersionToDraft : function(from){
        var ret = [];
        ret = ret.concat(OperationBuilder.DbDelete("draft", { query : {adid : adid}}));
        ret = ret.concat(OperationBuilder.getVersion(version));
        ret = ret.concat(OperationBuilder.DbCreate("draft", null));
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
        ret = [];
        if(!overwrite){
            ret = ret.concat(OperationBuilder.publishDraftByAdid(adid));
        }
        if(version){
            ret = ret.concat(OperationBuilder.checkOutVersionToDraft(version))
        }else{
            ret = ret.concat(OperationBuilder.createEmptyDraft(adid));
        }
        return ret;
    },

    /**
     * save current draft to a new version
     * @param adid
     * @returns {Array}
     */
    publishDraftByAdid : function(adid){
        var ret = [];
        //get draft, and save it no a new version
        ret = ret.concat(OperationBuilder.getDraftByAdid(adid));
        ret = ret.concat(OperationBuilder.DbCreate("version", null));
        return ret;
    },

    /**
     * save current draft to a new version
     * @param draftId
     * @returns {Array}
     */
    publishDraft : function(query){
        var ret = [];

        ret = ret.concat(OperationBuilder.getDraft(query));
        ret = ret.concat(OperationBuilder.DbCreate("version", null));

        return ret;
    },

    /**
     * get specified draft
     * @param query
     * @returns {*[]}
     */
    getDraft : function(query){
        return [{
            type : "db",
            operation : "getOne",
            model : "draft",
            data : {
                query : query
            }
        }]
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

    updateDraft : function(draft){
        ret = [];
        ret = ret.concat(OperationBuilder.DbDelete("draft", { query : {adid : draft.adid}}));
        ret = ret.concat(OperationBuilder.DbCreate("draft", { data : draft}));
        return ret;
    }
};

module.exports.mongooseWrapper = _mongooseErrorHandler;
module.exports.wrapCallback = _wrapCallback;
module.exports.operationBuilder = OperationBuilder;
module.exports.transformOriginToRelease = _transformOriginToRelease;