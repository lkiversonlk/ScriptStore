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

/**
 * get version and draft
 * the versions will be marked 1 - n as time goes late
 */
router.get("/", function(req, res, next){
    res.SsiData.addOperations(operBuilder.getConfigurations(req.parameters));
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
router.get("/publish", function(req, res, next){
    if(req.query.adid || req.query._id){
        req.SsiData.addOperations(operBuilder.publishDraft(req.query));
        return next();
    }else{
        next(SsiError.ParameterInvalidError("provide adid or _id at least"));
    }
});

module.exports = router;