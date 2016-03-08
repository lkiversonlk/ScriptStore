/**
 * Created by jerry on 3/4/16.
 */

var express = require("express"),
    router = express.Router();

var middlewares = require("../middlewares"),
    operBuilder = middlewares.utils.operationBuilder;
var SsiError = require("../errors");
var schemas = require("./schemas");
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
 * update draft, delete the old one and create a new one
 */
router.put("/draft", function(req, res, next){
    var validate = schemas.create_draft;
    if(validate(req.body)){
        req.SsiData.addOperations(operBuilder.updateDraft(req.body));
        return next();
    }else{
        next(SsiError.ParameterInvalidError("post data not valid draft"));
    }
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

/**
 * get all the configurations of specified advertiser including draft
 */
router.get("/:adid", function(req, res, next){
    req.SsiData.addOperations(operBuilder.getConfigurations(req.params.adid));
    return next();
});
module.exports = router;