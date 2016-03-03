var express = require('express');
var router = express.Router();
var middlewares = require("../middlewares");
var SsiErrors = require("../errors");
var schemas = require("./schemas");

var restDataPath = "restfulData";

function _forOperationMiddleware(operation, model, data){
    ret = {};
    ret.operation = operation;
    ret.model = model;
    ret.data = data;
    return ret;
};

var dbModelResources = [
    "version",
    "active",
    "trigger"
];

//register restful method
dbModelResources.forEach(function(resource){
    var restfulRegistry = new middlewares.restfulRegistry(resource, restDataPath);
    restfulRegistry.registerSearchById(function(req, res, next){
        var data = req[restDataPath];
        if(!data.query) {
            data.query = {}
        }
        data.query._id = req.params.id;
        req.SsiData = _forOperationMiddleware("getOne", restfulRegistry.name, data);
        next();
    });

    restfulRegistry.registerSearch(function(req, res, next){
        req.SsiData = _forOperationMiddleware("getAll", restfulRegistry.name, req[restDataPath]);
        return next();
    });

    restfulRegistry.registerCreate(function(req, res, next){
        var schema = schemas[restfulRegistry.name];
        if(!schema || !schema(req[restDataPath].data)){
            next(SsiErrors.ParameterInvalidError("failed to create with invalid data"));
        }
        req.SsiData = _forOperationMiddleware("create", restfulRegistry.name, req[restDataPath]);
        _forOperationMiddleware(req, "create", restfulRegistry.name, req.body);
        return next();
    });

    //doesn't register update

    restfulRegistry.serve(router);
});


var releaseResource = new middlewares.restfulRegistry("release");
releaseResource.registerSearchById(function(req, res, next){
    req.SsiData = _forOperationMiddleware("release", "version", { query : { _id : req.params.id }});
    next();
});
releaseResource.serve(router);

var debugResource = new middlewares.restfulRegistry("debug");
debugResource.registerSearchById(function(req, res, next){
    req.SsiData = _forOperationMiddleware("debug", "version", { query : { _id : req.params.id }});
});
debugResource.serve(router);

router.use(middlewares.operation);
router.use(middlewares.presentation.present);


module.exports = router;
