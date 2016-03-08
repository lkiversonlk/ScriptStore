/**
 * Created by jerry on 3/7/16.
 */

var app = angular.module("scriptStore", []);

app.provider('restApi', function(){
    var self = this;
    self.$get = ['$http', '$q', function($http, $q){

        function apiCaller(basePath){
            this._basePath = basePath
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

            var defer = $q.defer();
            var promise = $http(req)
                .then(function(response){
                    if(response.data.code != 0){
                        //alert(response.data.data);
                        return $q.reject(response.data);
                    }else{
                        return response.data.data;
                    }
                }, function(response){
                    alert(response.statusText);
                    return $q.reject(response.statusText);
                });
            return promise;
        };

        return apiCaller;
    }]
});

app.factory("appState", function($rootScope){
    var state = {
        currentAdid : null
    };

    var broadcast = function(property){
        $rootScope.$broadcast('state.' + property, state);
    };

    var update = function(property, value){
        state[property] = value;
        broadcast(property);
    };
    return {
        update : update,
        state : state
    }
});

app.controller("versionListController", function($scope, appState, restApi){

    $scope.configurationApi = new restApi("/configuration");
    $scope.versions = [];
    $scope.versionMap = {};

    $scope.updateAdvertiser = function(adid){
        var selfVersions = [];
        $scope.configurationApi
            ._handle("GET", "/list/" + adid, null, null)
            .then(function(versions){
                $scope.versions = versions;
                versions.forEach(function(version){
                    $scope.versionMap[version._id] = version;
                });
            });
    };

    $scope.$on("state.currentAdid", function(event, newState){
        $scope.updateAdvertiser(newState.currentAdid);
    });

    $scope.createDraft = function(){
        var query = {
            adid : appState.state.currentAdid
        };
        $scope.configurationApi
            ._handle("GET", "export", query, null)
            .then(function(data){
                alert("创建成功");
            });
    }

    $scope.updateVersion = function(){

        appState.update("currentVersion", $scope.versionMap[$scope.currentVersionId]);
    }
});

app.controller("currentVersionController", function($scope, restApi){
    $scope.$on("state.currentVersion", function(event, value){
        $scope.currentVersion = value;
    });

    $scope.createTag = function(){

    };

    $scope.createTrigger = function(){

    };
});

app.controller("advertiserListController", function($scope, appState){

    $scope.currentAdid = appState.state.currentAdid;

    $scope.update = function(){
        appState.update("currentAdid", $scope.currentAdid);
    };

    $scope.advertisers = [
        {
            name : "testAd2",
            id : "2343"
        },
        {
            name : "2we2",
            id : "23423"
        }
    ]
});

app.directive("tagsListDirective", function(){

});

app.directive("tagDetailDirective", function(){

});
