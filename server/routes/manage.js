/**
 * Created by jerry on 3/4/16.
 */

var express = require("express"),
    router = express.Router();

var middlewares = require("../middlewares"),
    operBuilder = middlewares.utils.operationBuilder;
var SsiError = require("../errors");
var schemas = require("./schemas");
var logger = require("../log").getLogger("routers.configuration");

/**q
 * get version and draft
 * the versions will be marked 1 - n as time goes late
 */
router.get("/", function(req, res, next){
    req.SsiData.addOperations(operBuilder.getConfigurations(req.parameters));
    next();
});

/**
 * checkout specified version to be the current draft of specified adid
 *
 * * if no version id is provided, create an empty draft
 * * if not overwrite, previous draft will be saved as a new version
 */
router.get("/export", function(req, res, next){
    var from = null, overwrite = true, adid = null;

    if(req.query.adid){
        adid = req.query.adid;
    }else{
        return next(SsiError.ParameterInvalidError("adid is required"));
    }
    if(req.query.from){
        from = req.query.from;
    }
    if(req.query.overwrite){
        overwrite = !(req.query.overwrite == "false");
    }

    req.SsiData.addOperations(operBuilder.exportVersionToDraft(adid, from, overwrite));
    return next();
});

/**
 * publish specified draft to a new version
 */
router.get("/toVersion/:id", function(req, res, next){
    var parameters = req.parameters;
    if(!parameters.query) {
        parameters.query = {}
    }
    parameters.query._id = req.params.id;
    req.SsiData.addOperations(operBuilder.saveDraftToVersion(parameters));
    return next();
});

/**
 * publish specified version
 *
 */
router.get("/publish/version", function(req, res, next){
    var parameters = req.parameters;
    if(parameters.query.adid && parameters.query._id){
        req.SsiData.addOperations(operBuilder.publishVersion(parameters));
        return next();
    }else{
        return next(SsiError.ParameterInvalidError("adid and _id are required"));
    }
});

/**
 * publish draft of adid
 */
router.get("/publish/draft", function(req, res, next){
    var parameters = req.parameters;
    if(parameters.query.adid){
        req.SsiData.addOperations(operBuilder.publishDraft(parameters));
        return next();
    }else{
        return next(SsiError.ParameterInvalidError("adid is required"));
    }
});

module.exports = router;