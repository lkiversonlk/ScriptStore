var express = require('express');
var router = express.Router();
var middlewares = require("../middlewares"),
    operBuilder = middlewares.utils.operationBuilder;
var SsiErrors = require("../errors");
var schemas = require("./schemas");
var logger = require("../log").getLogger("routes.rest");

var dbModelResources = [
    "version",
    "draft",
    "release"
];

dbModelResources.forEach(function(resource){
    var restfulRegistry = new middlewares.restfulRegistry(resource);
    restfulRegistry.registerSearchById(function(req, res, next){
        var parameters = req.parameters;
        if(!parameters.query) {
            parameters.query = {}
        }
        parameters.query._id = req.params.id;
        req.SsiData.addOperations(operBuilder.DbGetOne(restfulRegistry.name, parameters));
        if(parameters.release){
            req.SsiData.addOperations(operBuilder.getReleasedContent());
        }
        next();
    });

    restfulRegistry.registerSearch(function(req, res, next){
        var parameters = req.parameters;
        req.SsiData.addOperations(operBuilder.DbGetAll(restfulRegistry.name, req.parameters));
        if(parameters.release){
            req.SsiData.addOperations(operBuilder.getReleasedContent());
        }
        return next();
    });

    restfulRegistry.registerCreate(function(req, res, next){
        var schema = schemas["create_" + restfulRegistry.name];
        if(!schema || !schema(req.parameters.data)){
            if(schema){
                logger.log("debug", "create " + restfulRegistry.name + " failed, error is " + JSON.stringify(schema.errors));
            }else{
                logger.log("debug", "creation json schema for " + restfulRegistry.name + " not existed");
            }
            next(SsiErrors.ParameterInvalidError("failed to create with invalid data"));
        }
        req.SsiData.addOperations(operBuilder.DbCreate(restfulRegistry.name, req.parameters));
        operBuilder.DbCreate(restfulRegistry.name, req.body);
        return next();
    });

    restfulRegistry.registerUpdateById(function(req, res, next){
        var schema = schemas["create_" + restfulRegistry.name];
        if(!schema || !schema(req.parameters.data)){
            if(schema){
                logger.log("debug", "update " + restfulRegistry.name + " failed, error is " + JSON.stringify(schema.errors));
            }else{
                logger.log("debug", "update json schema for " + restfulRegistry.name + " not existed");
            }
            next(SsiErrors.ParameterInvalidError("failed to create with invalid data"));
        }

        var data = req.parameters;
        if(!data.query) {
            data.query = {}
        }
        data.query._id = req.params.id;
        req.SsiData.addOperations(operBuilder.DbUpdate(restfulRegistry.name, data));
        next();
    });

    restfulRegistry.registerUpdate(function(req, res, next){
        var schema = schemas["create_" + restfulRegistry.name];
        if(!schema || !schema(req.parameters.data)){
            if(schema){
                logger.log("debug", "update " + restfulRegistry.name + " failed, error is " + JSON.stringify(schema.errors));
            }else{
                logger.log("debug", "update json schema for " + restfulRegistry.name + " not existed");
            }
            next(SsiErrors.ParameterInvalidError("failed to create with invalid data"));
        }

        var data = req.parameters;
        req.SsiData.addOperations(operBuilder.DbUpdate(restfulRegistry.name, data));
        next();
    });

    restfulRegistry.registerDelete(function(req, res, next){
        var data = req.parameters;
        if(!data.query){
            data.query = {};
        }
        req.SsiData.addOperations(operBuilder.DbDelete(restfulRegistry.name, data));
        next();
    });

    restfulRegistry.serve(router);
});


module.exports = router;
