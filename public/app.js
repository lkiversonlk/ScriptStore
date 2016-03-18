/**
 * Created by jerry on 3/11/16.
 */

var app = angular.module("scriptStore", ['am.multiselect', 'ngCookies', 'blockUI']);

app.provider("httpApi", function(){
    var self = this;
    self.$get = ["$http", "$q", function($http, $q){
        function apiCaller(basePath){
            this._basePath = basePath;
        }

        apiCaller.prototype._handle = function(method, model, getParams, postParams){
            var self = this;
            var req = {
                method : method,
                url : self._basePath + "/" + model,
                headers : {
                    "Content-type" : "application/json"
                }
            };
            req.data = postParams;
            req.params = getParams;

            var deferred = $q.defer();
            $http(req)
                .then(function(response){
                    if(response.data.code == 0){
                        deferred.resolve(response.data.data);
                    }else{
                        alert(response.data.data);
                        deferred.reject(response.data.data);
                    }
                }, function(response){
                    alert(response.status);
                    deferred.reject(response.status);
                });

            return deferred.promise;
        };

        return apiCaller;
    }];
});

app.provider("restApi", function(){
    var self = this;
    var apiCaller = null;

    self.$get = ["httpApi", function(httpApi){
        apiCaller = new httpApi("/rest");

        function RestCommand(apiCaller){
            this.api = apiCaller;
        }

        RestCommand.prototype._getObjectById = function(model, id, select, getParam){
            if(select){
                getParam.select = select;
            }
            return this.api._handle("GET", model+"/" + id, getParam, null);
        };

        RestCommand.prototype._queryObjects = function(model, query, select, getAttr){
            var getPramas = getAttr ? getAttr : {};
            if(query){
                getPramas.query = query;
            }
            if(select){
                getPramas.select = select;
            }

            return this.api._handle("GET", model, getPramas, null);
        };

        RestCommand.prototype._updateByQuery = function(model, query, updates){
            return this.api._handle("PUT", model, {query : query}, updates);
        };

        RestCommand.prototype._updateById = function(model, data){
            return this.api._handle("PUT", model + "/" + data._id, null, data);
        };

        RestCommand.prototype._create = function(model, data){
            return this.api._handle("POST", model, null, data);
        };

        RestCommand.prototype._delete = function(model, query){
            return this.api._handle("DELETE", model, {query : query}, null);
        };

        var resources = [
            "release",
            "draft",
            "version"
        ];

        function capitalize(word){
            return word.charAt(0).toUpperCase() + word.slice(1);
        }

        resources.forEach(function(resource){
            RestCommand.prototype["get" + capitalize(resource) + "ById"] = function(id, select, getParam, putParam){
                return this._getObjectById(resource, id, select, getParam, putParam);
            };

            RestCommand.prototype["create" + capitalize(resource)] = function(data){
                return this._create(resource, data);
            };

            RestCommand.prototype["search" + capitalize(resource)] = function(query, select, getAttr){
                return this._queryObjects(resource, query, select, getAttr);
            };

            RestCommand.prototype["update" + capitalize(resource)] = function(data){
                return this._updateById(resource, data);
            };

            RestCommand.prototype["delete" + capitalize(resource)] = function(data){
                return this._delete(resource, {_id : data._id});
            }
        });

        return new RestCommand(apiCaller);
    }];
});

app.provider("manageApi", function(){
    var self = this;
    var apiCaller = null;

    self.$get = ["httpApi", function(httpApi){
        apiCaller = new httpApi("/manage");

        function ManageCommand(apiCaller){
            this.api = apiCaller;
        }

        ManageCommand.prototype.loadAllVersions = function(adid){
            return this.api._handle("GET", "", {query : {adid : adid}, select : []}, null);
        };

        ManageCommand.prototype.saveDraftToVersion = function(adid){
            return this.api._handle("GET", "toVersion", {query : {adid : adid}}, null);
        };

        ManageCommand.prototype.createEmptyDraft = function(advertiser){
            return this.api._handle("GET", "export", {query : {adid : advertiser}}, null);
        };

        ManageCommand.prototype.exportVersionToDraft = function(advertiser, version, overwrite){
            return this.api._handle("GET", "export", {query : {adid : advertiser}, from : version, overwrite : overwrite}, null);
        };

        ManageCommand.prototype.debugDraft = function(advertiser){
            return this.api._handle("GET", "debug/draft", {query : {adid : advertiser}}, null);
        };

        ManageCommand.prototype.debugVersion = function(advertiser, version){
            return this.api._handle("GET", "debug/version/" + version, {query : {adid : advertiser}}, null);
        };

        ManageCommand.prototype.undebug = function(advertiser){
            return this.api._handle("GET", "undebug", {query : {adid : advertiser}}, null);
        };

        ManageCommand.prototype.publish = function(version){
            if(version.draft){
                return this.api._handle("GET", "publish/draft", {query : {adid : version.adid}}, null);
            }else{
                return this.api._handle("GET", "publish/version/" + version._id, {query : {adid : version.adid}}, null);
            }
        };

        ManageCommand.prototype.getCurrentRelease = function(adid, cookie){
            if(cookie){
                return this.api._handle("GET", "release", {query : {adid : adid}, cookie : cookie}, null);
            }else{
                return this.api._handle("GET", "release", {query : {adid : adid}}, null);
            }
        }
        return new ManageCommand(apiCaller);
    }];
});

app.factory("appControl", function($rootScope, $q, $cookies, restApi, manageApi){
    var advertiser = null;
    var versionList = null;

    var currentVersion = null;
    var currentVersionCache = null;

    var cookieKey = "scriptStore";

    var Events = {
        ADVERTISER_CHANGE : "adidChange",
        VERSIONS_RELOADED : "verReloaded",
        VERSION_CHANGE : "verChange",
        DEBUG : "debug",
        PUBLISH : "publish"
    };

    var commands = {
        setAdvertiser : function(id){
            advertiser = id;
            $rootScope.$broadcast(Events.ADVERTISER_CHANGE);
            return commands.reloadVersions();
        },

        setCurrentVersion : function(versionId){
            if(versionId != currentVersion){
                currentVersionCache = null;
            }
            currentVersion = versionId;
            $rootScope.$broadcast(Events.VERSION_CHANGE);
        },

        reloadVersions : function(){
            return manageApi.loadAllVersions(advertiser)
                .then(
                    function (versions) {
                        versionList = versions;
                        $rootScope.$broadcast(Events.VERSIONS_RELOADED);

                        if (versionList.length > 0) {
                            commands.setCurrentVersion(versionList[versionList.length - 1]._id);
                        } else {
                            commands.setCurrentVersion(null);
                        }
                    },
                    function(error){
                        alert(error);
                    });
        },

        getAdvertiser : function(){
            return advertiser;
        },

        getVersions : function(){
            return versionList;
        },

        getCurrentVersion : function(){
            return currentVersion;
        },

        createDraft : function(){
            return manageApi.createEmptyDraft(advertiser);
        },

        draftToVersion : function(){
            return manageApi.saveDraftToVersion(advertiser);
        },

        getCurrentVersionData : function(){
            var defer = $q.defer();

            var ret = defer.promise;

            if(currentVersion == null){
                defer.reject(null);
                return ret;
            }

            if(currentVersionCache){
                defer.resolve(currentVersionCache);
            }else{
                for(var i = 0; i < versionList.length; i ++){
                    if(versionList[i]._id == currentVersion){
                        if(versionList[i].draft == true){
                            restApi.getDraftById(currentVersion)
                                .then(
                                    function(data){
                                        data.draft = true;
                                        defer.resolve(data);
                                    },
                                    function(error){
                                        defer.reject(error);
                                    }
                                );
                        }else{
                            restApi.getVersionById(currentVersion)
                                .then(
                                    function(data){
                                        data.draft = false;
                                        defer.resolve(data);
                                    },
                                    function(error){
                                        defer.reject(error);
                                    }
                                );
                        }
                        return ret;
                    }
                }
            }
            defer.reject(null);
            return defer.promise;
        },

        deleteCurrentVersion : function(){
            return commands.getCurrentVersionData()
                .then(function(version){
                    if(version.draft){
                        //TODO: ....reject it!
                    }else{
                        currentVersion = null;
                        currentVersionCache = null;
                        return restApi.deleteVersion(version);
                    }
                });
        },

        versionToDraft : function(){
            return manageApi.exportVersionToDraft(advertiser, currentVersion, false);
        },

        updateDraft : function(draft){
            return restApi.updateDraft(draft);
        },

        debug : function(){
            var ret;
            commands.getCurrentVersionData()
                .then(function(version){
                    if(version.draft){
                        ret = manageApi.debugDraft(advertiser);
                    }else{
                        ret = manageApi.debugVersion(advertiser, version._id);
                    }
                    ret = ret.then(function(){
                        $rootScope.$broadcast(Events.DEBUG);
                    });
                    return ret;
                });

        },

        undebug : function(){
            var ret = manageApi.undebug(advertiser).then(function(){
                debugging = false;
                $rootScope.$broadcast(Events.DEBUG);
            });
            return ret;
        },

        getDebugInfo : function(){
            var cookie = $cookies.get(cookieKey);
            if(cookie){
                return JSON.parse(cookie)[advertiser];
            }else{
                return null;
            }
        },

        getCurrentReleaseOrDebug : function(){
            var cookie = $cookies.get(cookieKey);
            return manageApi.getCurrentRelease(advertiser, cookie);
        },

        publish : function(version){
            return commands.getCurrentVersionData()
                .then(function(version){
                    return manageApi.publish(version);
                }).then(function(){
                    $rootScope.$broadcast(Events.PUBLISH);
                });
        },

        Events : Events
    };

    return commands;
});
