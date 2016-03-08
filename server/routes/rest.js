var express = require('express');
var router = express.Router();
var middlewares = require("../middlewares"),
    operBuilder = middlewares.utils.operationBuilder;

var SsiErrors = require("../errors");
var schemas = require("./schemas");
var logger = require("../log").getLogger("routes.script");
var restDataPath = "restfulData";

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
        req.SsiData.addOperations(operBuilder.DbGetOne(restfulRegistry.name, data));
        next();
    });

    restfulRegistry.registerSearch(function(req, res, next){
        req.SsiData.addOperations(operBuilder.DbGetAll(restfulRegistry.name, req[restDataPath]));
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
        req.SsiData.addOperations(operBuilder.DbCreate(restfulRegistry.name, req[restDataPath]));
        operBuilder.DbCreate(restfulRegistry.name, req.body);
        return next();
    });

    restfulRegistry.registerUpdateById(function(req, res, next){
        var data = req[restDataPath];
        if(!data.query) {
            data.query = {}
        }
        data.query._id = req.params.id;
        req.SsiData.addOperations(operBuilder.DbUpdate(restfulRegistry.name, data));
        next();
    });

    restfulRegistry.serve(router);
});


module.exports = router;
