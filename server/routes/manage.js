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
    var parameters = req.parameters;
    if(!parameters.query.adid){
        return next(SsiError.ParameterInvalidError("adid is required"));
    }
    req.SsiData.addOperations(operBuilder.exportVersionToDraft(parameters.query.adid, parameters.from, parameters.overwrite));
    return next();
});

/**
 * publish specified draft to a new version
 */
router.get("/toversion/:id", function(req, res, next){
    var parameters = req.parameters;
    if(parameters.query && parameters.query.adid) {
        parameters.query._id = req.params.id;
        req.SsiData.addOperations(operBuilder.saveDraftToVersion(parameters));
        return next();
    }else{
        return next(SsiError.ParameterInvalidError("adid are required"));
    }
});

/**
 * publish specified version
 *
 */
router.get("/publish/version/:id", function(req, res, next){
    var parameters = req.parameters;
    if(parameters.query && parameters.query.adid){
        parameters.query._id = req.params.id;
        req.SsiData.addOperations(operBuilder.publishVersion(parameters));
        return next();
    }else{
        return next(SsiError.ParameterInvalidError("adid are required"));
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

router.get("/debug/draft", function(req, res, next){
    if(req.parameters.query.adid){
        req.SsiData.addOperations(operBuilder.debugDraft(req.parameters));
        return next();
    }else{
        return next(SsiError.ParameterInvalidError("adid is required"));
    }
});

router.get("/debug/version/:id", function(req, res, next){
    if(req.parameters.query.adid){
        req.parameters.query._id = req.params.id;
        req.SsiData.addOperations(operBuilder.debugVersion(req.parameters));
        return next();
    }else{
        return next(SsiError.ParameterInvalidError("adid is required"));
    }
});

router.get("/undebug", function(req, res, next){
    if(req.parameters.query.adid){
        req.SsiData.addOperations(operBuilder.undebug(req.parameters));
        return next();
    }else{
        return next(SsiError.ParameterInvalidError("adid is required"));
    }
});

router.get("/release", function(req, res, next){
    var adid = "";
    if(adid = req.parameters.query.adid){
        req.SsiData.addOperations(operBuilder.DbGetOne("release", req.parameters));
        return next();
    }else{
        return next(SsiError.ParameterInvalidError("adid is required"));
    }
});

router.post("/release", function(req, res, next){
    var adid = "";
    if(aid = req.parameters.query.adid){
        var cookies = {};
        var cookie = "";
        if((cookies = req.body) && (cookie = cookies[adid])){
            req.parameters.release = true;
            if(cookie.length > 0){
                req.parameters.query._id = cookie;
                req.SsiData.addOperations(operBuilder.DbGetOne("version", req.parameters));
            }else{
                req.SsiData.addOperations(operBuilder.DbGetOne("draft", req.parameters));
            }
            return next();
        }else{
            req.SsiData.addOperations(operBuilder.DbGetOne("release", req.parameters));
            return next();
        }
    }else{
        return next(SsiError.ParameterInvalidError("adid is required"));
    }
});

module.exports = router;