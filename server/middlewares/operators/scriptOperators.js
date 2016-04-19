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
 * the transform will compress the properties
 * @param version
 * @returns {{tags: Array}}
 * @private
 */
function  _transform(version){
    var oldTriggers = version.triggers;
    var ret = {
        t : []  //tags
    };
    version.tags.forEach(function(tag){
        var newTag = {
            s : tag.script,  //script
            t : [] //triggers
        };
        if(tag.conversion){
            newTag.c = tag.conversion; //conversion
        }
        tag.triggers.forEach(function(trigger){
            var oldTrigger = oldTriggers[trigger];
            newTag.t.push({    //triggers
                r : oldTrigger.ruleType, //ruleType
                o : oldTrigger.op,       //op
                v : oldTrigger.value     //value
            });
        });
        ret.t.push(newTag);  //tags
    });
    ret.v = version._id;    //vid
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
    res.cookie(COOKIE_KEY, JSON.stringify(cookie), {domain : ".ipinyou.com"});
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
            res.clearCookie(COOKIE_KEY, {domain : ".ipinyou.com"});
        }else{
            res.cookie(COOKIE_KEY, JSON.stringify(cookie), {domain : ".ipinyou.com"});
        }
        return callback(null);
    }else{
        return callback(null);
    }
};

module.exports = ret;