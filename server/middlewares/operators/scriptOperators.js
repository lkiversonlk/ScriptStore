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
/*
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
*/
function  _transform(version){
    var oldTriggers = version.triggers;
    var ret = {
        tags : []
    };
    version.tags.forEach(function(tag){
        var newTag = {
            script : tag.script,
            triggers : []
        };
        if(tag.conversion){
            newTag.conversion = tag.conversion;
        }
        tag.triggers.forEach(function(trigger){
            var oldTrigger = oldTriggers[trigger];
            newTag.triggers.push({
                ruleType : oldTrigger.ruleType,
                op : oldTrigger.op,
                value : oldTrigger.value
            });
        });
        ret.tags.push(newTag);
    });
    ret.vid = version._id;
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

ret.script_get_all = function(data, context, callback){
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
    );
};

var COOKIE_KEY = "pycodeconf";

var expirationTime = 40 * 60 * 1000;
/**
 * Cookie data structure is like
 *
 * ScriptStore : {
 *    advertiserId1 : "",
 *    advertiserId2 : "sdferwedfdf"
 * }
 *
 * if value is empty array, indicating debug current draft
 * else debug specified verison.
 * @param data {
 *    query : {adid : }
 *    data : data
 * }
 * @param context
 * @param callback
 */
ret.script_set_cookie = function(data, context, callback){
    var advertiser = data.query.advid;
    var req = context[0];
    cookie = req.cookies[COOKIE_KEY];
    if(cookie){
        cookie = JSON.parse(cookie);
    }else{
        cookie = {};
    }
    cookie[advertiser] = data.data;
    var res = context[1];
    res.cookie(COOKIE_KEY, JSON.stringify(cookie), {maxAge : expirationTime});
    callback(null);
};

ret.script_delete_cookie = function(data, context, callback){
    var advertiser = data.query.advid;
    var req = context[0];
    cookie = req.cookies[COOKIE_KEY];
    if(cookie){
        cookie = JSON.parse(cookie);
        delete cookie[advertiser];

        var res = context[1];
        if(Object.keys(cookie).length == 0){
            res.clearCookie(COOKIE_KEY);
        }else{
            res.cookie(COOKIE_KEY, JSON.stringify(cookie), {maxAge : expirationTime});
        }
        return callback(null);
    }else{
        return callback(null);
    }
};

module.exports = ret;