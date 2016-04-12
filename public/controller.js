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



    function updateDebug(){
        var debugInfo = appControl.getDebugInfo();
        if(debugInfo !== null){
            $scope.debugging = true;
        }else{
            $scope.debugging = false;
        }
    }

    updateDebug();

    $scope.$on(appControl.Events.VERSIONS_RELOADED, function(){
        $scope.versions = appControl.getVersions();
        $scope.shouldCreateDraft = $scope.versions.length == 0;
        updateDebug();
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

    $scope.$on(appControl.Events.DEBUG, updateDebug);

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
        return appControl.publish()
            .then(function(){
                return appControl.reloadVersions();
            })
            .then(function(){

            });
    }

    $scope.getDate = function(date){
        return new Date(date).toLocaleTimeString();
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
    $scope.allowEditing = false;

    $scope.updateTag = function(i){
        //alert("trying to update tag " + i);
        var tag = this.tag; //this points to the child scope
        appControl.getCurrentVersionData()
            .then(function(version){
                if(version.draft){
                    version.tags[i] = tag;
                    return appControl.updateDraft(version);
                }else{
                    //TODO: reject it!
                }
            })
            .then(function(){
                return appControl.reloadVersions();
            });
    }

    $scope.$on(appControl.Events.VERSION_CHANGE, function(){
        appControl.getCurrentVersionData()
            .then(
                function(version){
                    $scope.tags = version.tags;
                    $scope.triggers = version.triggers;
                    $scope.allowEditing = version.draft;
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
                    $scope.allowEditing = version.draft;
                },
                function(error){
                    $scope.triggers = [];
                }
            )
    });

    $scope.updateTrigger = function(i){
        //alert("trying to update tag " + i);
        var trigger = this.trigger; //this points to the child scope
        appControl.getCurrentVersionData()
            .then(function(version){
                if(version.draft){
                    version.triggers[i] = trigger;
                    return appControl.updateDraft(version);
                }else{
                    //TODO: reject it!
                }
            })
            .then(function(){
                return appControl.reloadVersions();
            });
    }
});

app.controller("currentReleaseController", function($scope, appControl){
    function update(){
        var debugInfo = appControl.getDebugInfo();
        if(debugInfo !== null && debugInfo !== undefined){
            $scope.debugging = true;
            if(debugInfo.length > 0){
                $scope.status = "调试广告主" + debugInfo + " 版本中";
            }else{
                $scope.status = "调试广告主 草稿中";
            }
        }else{
            $scope.debugging = false;
            $scope.status = "正常"
        }

        appControl.getCurrentReleaseOrDebug()
            .then(function(content){
                $scope.content = JSON.stringify(content);
            });
    }

    $scope.$on(appControl.Events.ADVERTISER_CHANGE, update);
    $scope.$on(appControl.Events.VERSIONS_RELOADED, update);
    $scope.$on(appControl.Events.DEBUG, update);
    $scope.$on(appControl.Events.PUBLISH, update);

});