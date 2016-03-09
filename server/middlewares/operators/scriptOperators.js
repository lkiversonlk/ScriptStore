/**
 * Created by jerry on 3/4/16.
 */

var Dao = require("../../dao");
var _wrapCallback = require("./utils").wrapCallback;
var _transformOriginToRelease = require("./utils").transformOriginToRelease;

var logger = require("../../log").getLogger("middlewares.operators.scriptOperators");
var SsiError = require('../../errors');
var async = require("async");
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
 * @param adid
 * @param context
 * @param callback
 */
/*
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
*/

function  _transform(version){
    if(version.toJSON){
        version = version.toJSON();
    }

    var oldTriggers = version.triggers;
    var ret = {
        tags : []
    };
    version.tags.forEach(function(tag){
        if(!tag.deleted){
            var newTag = {
                script : tag.script,
                triggers : []
            };
            tag.triggers.forEach(function(trigger){
                newTag.triggers.push(oldTriggers[trigger]);
            });
        }
    });
    return ret;
}


ret.script_transform_version = function(data, context, callback){
    var versions = data.data;
    try{
        if(Array.isArray(versions)) {
            return callback(null, versions.map(function(version){
                return _transform(version);
            }));
        }else{
            return callback(null, _transform(versions));
        }
    }catch (error){
        callback(error);
    }
};

ret.script_get_configurations = function(data, context, callback){
    if(data.query.adid){
        async.parallel(
            [
                function(callback){
                    Dao.readDoc("version", data, callback);
                },
                function(callback){
                    Dao.readOneDoc("draft", data, callback);
                }
            ],
            _wrapCallback(function(err, results){
                if(err) {
                    callback(err);
                }else{
                    var ret = [];
                    results[0].forEach(function(version, index){
                        var json = version.toJSON();
                        ret.push(json);
                    });
                    if(results[1]){
                        var json = results[1].toJSON();
                        json.draft = true;
                        ret.push(json);
                    }
                    callback(null, ret);
                }
            })
        )
    }else{
        logger.log("error", "no adid passed to script_get_configurations");
        callback(SsiError.ParameterInvalidError("adid is required to load configurations"));
    }
}

module.exports = ret;