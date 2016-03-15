/**
 * Created by jerry on 3/11/16.
 */

app.controller("selectAdvertiserController", function($scope, appControl){
    $scope.input = null;
    $scope.confirm = function(){
        appControl.setAdvertiser($scope.input)
            .then(function(){}, function(error){
                alert(error);
                $scope.input = appControl.getAdvertiser();
            });
    }
});

app.controller("selectVersionController", function($scope, appControl){
    $scope.shouldCreateDraft = false;
    $scope.draft = false;
    $scope.version = false;

    var debugInfo = appControl.getDebugInfo();
    if(debugInfo){
        $scope.debugging = debugInfo.debug;
    }else{
        $scope.debugging = false;
    }

    $scope.$on(appControl.Events.VERSIONS_RELOADED, function(){
        $scope.versions = appControl.getVersions();
        $scope.shouldCreateDraft = $scope.versions.length == 0;
    });

    $scope.$on(appControl.Events.VERSION_CHANGE, function(){
        $scope.select = appControl.getCurrentVersion();
        appControl.getCurrentVersionData()
            .then(function(version){
                $scope.draft = (version.draft == true);
                $scope.version = !$scope.draft;
            }, function(error){
                $scope.draft = false;
                $scope.version = false;
            })

    });

    $scope.$on(appControl.Events.DEBUG, function(){
        var debugInfo = appControl.getDebugInfo();
        if(debugInfo){
            $scope.debugging = debugInfo.debug;
        }else{
            $scope.debugging = false;
        }
    });

    $scope.createDraft = function(){
        appControl.createDraft()
            .then(function(){
                return appControl.reloadVersions();
            });
    };

    $scope.changeVersion = function(){
        appControl.setCurrentVersion($scope.select);
    };

    $scope.toVersion = function(){
        appControl.draftToVersion()
            .then(function(){
                return appControl.reloadVersions();
            });
    };

    $scope.delete = function(){
        appControl.deleteCurrentVersion()
            .then(function(){
                return appControl.reloadVersions();
            })
    };

    $scope.toDraft = function(){
        return appControl.versionToDraft()
            .then(
                function(){
                    return appControl.reloadVersions();
                }
            );
    };

    $scope.debug = function(){
        return appControl.debug();
    };

    $scope.undebug = function(){
        return appControl.undebug();
    };

    $scope.publish = function(){
        return appControl.publish();
    }
});

app.controller("createTriggerController", function($scope, appControl){

    $scope.trigger = {};

    $scope.TRIGGER_TYPES = TRIGGER_TYPES;
    $scope.OPS = OPS;

    $scope.createTrigger = function(){
        appControl.getCurrentVersionData()
            .then(function(version){
                if(version.draft){
                    version.triggers.push($scope.trigger);
                    return appControl.updateDraft(version);
                }else{
                    //TODO: reject it!
                }
            })
            .then(function(){
                return appControl.reloadVersions();
            })
            .then(function(){
                $scope.trigger = {}
            });
    };

    $scope.allowEditing = false;

    $scope.$on(appControl.Events.VERSION_CHANGE, function(){
        appControl.getCurrentVersionData()
            .then(function(version){
                $scope.allowEditing = version.draft;
            });
    });
});

app.controller("createTagController", function($scope, appControl){

    $scope.tag = {
        triggers : []
    };
    $scope.triggers = [];
    $scope.triggerNames = [];

    /*
    $scope.TRIGGER_TYPES = TRIGGER_TYPES;
    $scope.OPS = OPS;
    */

    $scope.createTag = function(){
        appControl.getCurrentVersionData()
            .then(function(version){
                if(version.draft){
                    for(var i = 0; i < $scope.triggers.length; i++){
                        if($scope.triggerNames.indexOf($scope.triggers[i].name) > -1){
                            $scope.tag.triggers.push(i);
                        }
                    }
                    version.tags.push($scope.tag);
                    return appControl.updateDraft(version);
                }else{
                    //TODO: reject it!
                }
            })
            .then(function(){
                return appControl.reloadVersions();
            })
            .then(function(){
                $scope.tag = {
                    triggers : []
                };
            });
    };

    $scope.allowEditing = false;

    $scope.$on(appControl.Events.VERSION_CHANGE, function(){
        appControl.getCurrentVersionData()
            .then(function(version){
                $scope.allowEditing = version.draft;
                $scope.triggers = version.triggers;
            });
    });
});

app.controller("tagsController", function($scope, appControl){
    $scope.tags = [];
    $scope.$on(appControl.Events.VERSION_CHANGE, function(){
        appControl.getCurrentVersionData()
            .then(
                function(version){
                    $scope.tags = version.tags;
                    $scope.triggers = version.triggers;
                },
                function(error){
                    $scope.tags = [];
                }
            )
    });
});

app.controller("triggersController", function($scope, appControl){
    $scope.triggers = [];
    $scope.TRIGGER_TYPES = TRIGGER_TYPES;
    $scope.OPS = OPS;

    $scope.$on(appControl.Events.VERSION_CHANGE, function(){
        appControl.getCurrentVersionData()
            .then(
                function(version){
                    $scope.triggers = version.triggers;

                },
                function(error){
                    $scope.triggers = [];
                }
            )
    });
});

app.controller("currentReleaseController", function($scope, appControl){
    function update(){
        var debugInfo = appControl.getDebugInfo();
        if(debugInfo){
            $scope.debugging = debugInfo.debug;
            if($scope.debugging){
                if(debugInfo.type == "draft"){
                    $scope.status = "调试广告主 草稿中";
                }else{
                    $scope.status = "调试广告主" + debugInfo.id + " 版本中";
                }
            }else{
                $scope.debugging = false;
                $scope.status = "正常版本";
            }
        }else{
            $scope.debugging = false;
            $scope.status = "正常版本";
        }

        appControl.getCurrentReleaseOrDebug()
            .then(function(content){
                $scope.content = JSON.stringify(content);
            });
    }

    $scope.$on(appControl.Events.ADVERTISER_CHANGE, update);
    $scope.$on(appControl.Events.DEBUG, update);

});