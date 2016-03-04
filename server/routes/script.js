var express = require('express');
var router = express.Router();
var middlewares = require("../middlewares");
var SsiErrors = require("../errors");
var schemas = require("./schemas");
var logger = require("../log").getLogger("routes.script");
var restDataPath = "restfulData";

function _forOperationMiddleware(operation, model, data){
    var ret = {};
    ret.operation = operation;
    ret.model = model;
    ret.data = data;
    return ret;
};

var dbModelResources = [
    "version"
    //"active"
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
        var schema = schemas["create_" + restfulRegistry.name];
        if(!schema || !schema(req[restDataPath].data)){
            if(schema){
                logger.log("debug", "create " + restfulRegistry.name + " failed, error is " + JSON.stringify(schema.errors));
            }else{
                logger.log("debug", "creation json schema for " + restfulRegistry.name + " not existed");
            }
            next(SsiErrors.ParameterInvalidError("failed to create with invalid data"));
        }
        req.SsiData = _forOperationMiddleware("create", restfulRegistry.name, req[restDataPath]);
        _forOperationMiddleware(req, "create", restfulRegistry.name, req.body);
        return next();
    });

    restfulRegistry.registerUpdateById(function(req, res, next){
        var data = req[restDataPath];
        if(!data.query) {
            data.query = {}
        }
        data.query._id = req.params.id;
        req.SsiData = _forOperationMiddleware("update", restfulRegistry.name, data);
        next();
    });

    restfulRegistry.serve(router);
});

//active only read
var activeResource = new middlewares.restfulRegistry("active");

activeResource.registerSearchById(function(req, res, next){
    var data = req[restDataPath];
    if(!data.query) {
        data.query = {}
    }
    data.query._id = req.params.id;
    req.SsiData = _forOperationMiddleware("getOne", "active", data);
    next();
});

activeResource.registerSearch(function(req, res, next){
    req.SsiData = _forOperationMiddleware("getAll", "active", req[restDataPath]);
    return next();
});

activeResource.serve(router);

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
