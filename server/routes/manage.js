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

router.use(function(req, res, next){
    if(req.parameters.query && req.parameters.query.adid){
        return next();
    }else{
        return next(SsiError.ParameterInvalidError("adid is required"));
    }
});

/**q
 * get version and draft
 * the versions will be marked 1 - n as time goes late
 */
router.get("/", function(req, res, next){
    req.SsiData.addOperations(operBuilder.getConfigurations(req.parameters));
    return next();
});

/**
 * checkout specified version to be the current draft of specified adid
 *
 * * if no version id is provided, create an empty draft
 * * if not overwrite, previous draft will be saved as a new version
 */
router.get("/export", function(req, res, next){
    req.SsiData.addOperations(operBuilder.exportVersionToDraft(req.parameters.query.adid, req.parameters.from, req.parameters.overwrite));
    return next();
});

/**
 * publish specified draft to a new version
 */
router.get("/toversion", function(req, res, next){
    req.SsiData.addOperations(operBuilder.saveDraftToVersion(req.parameters));
    return next();
});

/**
 * publish specified version
 *
 */
router.get("/publish/version/:id", function(req, res, next){
    var parameters = req.parameters;
    parameters.query._id = req.params.id;
    req.SsiData.addOperations(operBuilder.publishVersion(parameters));
    return next();
});

/**
 * publish draft of adid
 */
router.get("/publish/draft", function(req, res, next){
    var parameters = req.parameters;
    req.SsiData.addOperations(operBuilder.publishDraft(parameters));
    return next();
});

router.get("/debug/draft", function(req, res, next){
    req.SsiData.addOperations(operBuilder.debugDraft(req.parameters));
    return next();
});

router.get("/debug/version/:id", function(req, res, next){
    req.parameters.query._id = req.params.id;
    req.SsiData.addOperations(operBuilder.debugVersion(req.parameters));
    return next();
});

router.get("/undebug", function(req, res, next){
    req.SsiData.addOperations(operBuilder.undebug(req.parameters));
    return next();
});


router.get("/release", function(req, res, next){
    var parameters = req.parameters;
    var cookie;
    if(parameters.cookie && (cookie = parameters.cookie[parameters.query.adid])){
        if(cookie.length > 0){
            req.parameters.query= { _id : cookie};
            req.SsiData.addOperations(operBuilder.DbGetOne("version", req.parameters));
        }else{
            req.SsiData.addOperations(operBuilder.DbGetOne("draft", req.parameters));
        }
        req.SsiData.addOperations(operBuilder.getReleasedContent({data : null}));
        return next();
    }else{
        req.SsiData.addOperations(operBuilder.DbGetOne("release", req.parameters));
        return next();
    }

});


router.post("/release", function(req, res, next){
    var adid = req.parameters.query.adid;
    var cookies = req.body;
    var cookie = "";
    if(cookies && (cookie = cookies[adid])){
        req.parameters.release = true;
        if(cookie.length > 0){
            req.parameters.query= { _id : cookie};
            req.SsiData.addOperations(operBuilder.DbGetOne("version", req.parameters));
        }else{
            req.SsiData.addOperations(operBuilder.DbGetOne("draft", req.parameters));
        }
        req.SsiData.addOperations(operBuilder.getReleasedContent({data : null}));
        return next();
    }else{
        req.SsiData.addOperations(operBuilder.DbGetOne("release", req.parameters));
        return next();
    }
});

module.exports = router;