/**
 * Created by jerry on 3/4/16.
 */

var Dao = require("../../dao");
var _wrapCallback = require("./utils").wrapCallback;
var _transformOriginToRelease = require("./utils").transformOriginToRelease;

var logger = require("../../log").getLogger("middlewares.operators.scriptOperators");
var SsiError = require('../../errors');

var ret = {};

/**
 * release specified version
 * @param data
 * @param context
 * @param callback
 * @returns {*}
 */
ret.script_release_version = function(data, context, callback){
    if(data._id){
        Dao.readOneDoc("version", { query : { _id : data._id}}, _wrapCallback(function(error, version){
            if(error){
                return callback(error);
            }else{
                if(version){
                    version = version.toJSON();
                    var released = null;
                    try{
                        released  = _transformOriginToRelease(version);
                    }catch (error){
                        logger.log("error", "fail to transform origin version " + version._id + " to release, " + error.message);
                        return callback(SsiError.ServerError());
                    }

                    delete version._id;

                    Dao.updateOrInsertDoc(
                        "release",
                        {
                            query : {
                                adid : version.adid
                            },
                            updates : version
                        },
                        _wrapCallback(callback)
                    );
                }else{
                    logger.log("debug", "can't find version with id " + data._id);
                    return callback(SsiError.LogicError("trying to release an not existed version"));
                }
            }
        }));
    }else{
        logger.log("error", "release version without version id");
        return callback(SsiError.ServerError());
    }
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



module.exports = ret;