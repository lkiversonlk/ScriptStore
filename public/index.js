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
    $scope.current = {};
    $scope.configurationApi = new restApi("/configuration");
    $scope.update = function(adid){
        var selfVersions = [];
        $scope.configurationApi
            ._handle("GET", adid, null, null)
            .then(function(versions){
                $scope.versions = versions;
            });
    };



    $scope.$on("state.currentAdid", function(event, newState){
        $scope.update(newState.currentAdid);
    });

    $scope.createDraft = function(){
        var query = {
            adid : appState.state.currentAdid
        }
        $scope.configurationApi
            ._handle("GET", "export", query, null)
            .then(function(data){
                alert("创建成功");
            });
    }
});

app.controller("currentVersionController", function($scope){

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
