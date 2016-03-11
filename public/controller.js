/**
 * Created by jerry on 3/11/16.
 */
/*
app.controller("statusController", function($scope, httpApi){

    $scope.status = {};
    $scope.status.advertiser = null;
    $scope.status.currentId = null;
    $scope.status.version = null;
    $scope.status.versions = [];
    $scope.status.draft = false;
    $scope.status.needsSave = false;

    $scope.setCurrentAdvertiser = function(id){
        $scope.status.advertiser = id;
    };

    $scope.reloadVersions = function(){
        if($scope.status.advertiser == null){
            return ;
        }

        new httpApi("/manage")._handle("GET", "", {query : {adid : $scope.status.advertiser}}, null)
            .then(function(data){
                $scope.status.versions = data;
                if($scope.status.versions.length > 0 && !$scope.status.currentId){
                    $scope.status.version = $scope.status.versions[$scope.status.versions.length - 1];
                    $scope.status.currentId = $scope.status.version._id;
                    $scope.status.draft = true;
                }
            }, function(error){
                alert(error);
            });
    };

    $scope.updateDraft = function(){
        new httpApi("/rest")._handle("PUT", "draft/" + $scope.status.currentId, null, $scope.status.version)
            .then(function(result){
                $scope.reloadVersions();
            }, function(error){
                alert(error);
            });
    }

});
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

    $scope.$on(appControl.Events.VERSIONS_RELOADED, function(){
        $scope.versions = appControl.getVersions();
        $scope.shouldCreateDraft = $scope.versions.length == 0;
    });

    $scope.$on(appControl.Events.VERSION_CHANGE, function(){
        $scope.select = appControl.getCurrentVersion();
        appControl.getCurrentVersionData()
            .then(function(version){
                $scope.draft = (version.draft == true);
            }, function(error){
                $scope.draft = false;
            })

    });

    $scope.createDraft = function(){
        appControl.createDraft()
            .then(function(){
                return appControl.reloadVersions()
            });
    };

    $scope.changeVersion = function(){
        appControl.setCurrentVersion($scope.select);
    };

    $scope.toVersion = function(){
        appControl.draftToVersion()
            .then(function(){
                return appControl.reloadVersions();
            })
            .then(function(){

            }, function(error){

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
            )
            .then(function(){

            }, function(error){
                alert(error);
            });
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
            .then(function(){}, function(error){
                alert(error);
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

app.controller("createTagController", function($scope){

});

app.controller("tagsController", function($scope, appControl){
    $scope.tags = [];
    $scope.$on(appControl.Events.VERSION_CHANGE, function(){
        appControl.getCurrentVersionData()
            .then(
                function(version){
                    $scope.tags = version.tags;
                },
                function(error){
                    $scope.tags = [];
                }
            )
    });
});

app.controller("triggersController", function($scope, appControl){
    $scope.triggers = [];
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