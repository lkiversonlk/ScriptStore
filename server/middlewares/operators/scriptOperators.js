/**
 * Created by jerry on 3/4/16.
 */

var Dao = require("../../dao");
var _wrapCallback = require("./utils").wrapCallback;
var logger = require("../../log").getLogger("middlewares.operators.scriptOperators");
var SsiError = require('../../errors');

var ret = {};

ret.script_draft = function(data, callback){
    Dao.readOneDoc("draft", data, _wrapCallback(callback));
};

ret.script_release = function(versionid, callback){

};

ret.script_create_emptyDraft = function(callback){

};

/**
 *
 * @param versionid
 * @param context
 * @param callback
 */
ret.script_edit_version = function(versionid, context, callback){
    logger.log("debug", "edit version " + versionid);
    Dao.readDoc(
        "version",
        {
            query : {
                _id : versionid
            }
        },
        _wrapCallback(function(error, version){
            if(error){
                callback(error);
            }else{
                var version = version.toJSON();
                version.creation = Date.now();
                Dao.updateOrInsertDoc(
                    "draft",
                    {
                        query : {
                            adid : version.adid
                        },

                        updates : version
                    },
                    _wrapCallback(callback)
                )
            }
        })
    )
};

/**
 *
 * @param adid
 * @param context
 * @param callback
 */
ret.script_publish_draft = function(adid, context, callback){
    logger.log("debug", "publish draft of adid " + adid);
    Dao.readOneDoc(
        "draft",
        {
            query : {
                adid : adid
            }
        },
        _wrapCallback(function(error, draft){
            if(error) {
                callback(error);
            }else{
                //now save the draft
                //delete the creation time
                draft = draft.toJSON();
                delete draft.creation;
                Dao.createDoc(
                    "version",
                    draft,
                    _wrapCallback(callback));
            }
        })
    )
};

/**
 *
 * @param data
 * @param context
 * @param callback
 */
ret.script_transform_version = function(options, context, callback){
    var results = context[3];  //the result feed by last operation
    if(results.length == 0){
        logger.log("error", "script_transform_version needs data from last operation");
        callback(new SsiError.ServerError(""));
    }

    try{
        var result = results[results.length - 1];
        if(result.toJSON) {
            result = result.toJSON();
        }
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
    }
}

module.exports = ret;