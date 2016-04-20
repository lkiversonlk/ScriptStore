/**
 * Created by liukan on 4/20/16.
 */

var logger = require("./log").getLogger("timeCache");

var Q = require("Q");

function _cacheItem(item) {
    this.item = item;
    this.time = Date.now();
}

function TimeCache(time) {
    this.time = time;
    this.cache = {}
};

TimeCache.prototype.get = function (key) {
    var defer = Q.defer();
    var self = this;

    if(self.cache.hasOwnProperty(key)){
        var _cache = self.cache[key];

        if(Date.now() - _cache.time > self.time){
            defer.reject();
        }else{
            defer.resolve(self.cache[key].item);
        }
    }else{
        defer.reject()
    }
    return defer.promise;
};

TimeCache.prototype.set = function (key, item) {
    var self = this;
    self.cache[key] = new _cacheItem(item);
};

module.exports = TimeCache;