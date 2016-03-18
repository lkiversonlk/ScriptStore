/**
 * Created by jerry on 3/8/16.
 */

var jsen = require("jsen");
var SsiErrors = require("../errors");
var logger = require("../log").getLogger("middlewares.parameters");
var restDataSchema = {
    "type" : "object",
    "properties" : {
        "release" : {
            "type" : "boolean"
        },
        "select" : {
            "type" : ["array", "null"],
            "items" : {
                "type" : "string"
            }
        },
        "query" : {
            "type" : ["object", "null"],
        },
        "populate" : {
            "type" : ["array", "null"],
            "items" : {
                "type" : "string"
            }
        },
        "overwrite" : {
            "type" : "boolean"
        }
    }
};
var validate = jsen(restDataSchema);

function _extractDataForReq(req){
    var query = req.query;
    return {
        select : (query.select === undefined ? null : JSON.parse(query.select)),
        query : (query.query === undefined ? null : JSON.parse(query.query)),
        populate : (query.populate === undefined ? null : JSON.parse(query.populate)),
        overwrite : (query.overwrite !== "false"),
        release : (query.release == "true"),
        from : query.from,
        data : req.body,
        cookie : (query.cookie == undefined ? null : JSON.parse(query.cookie))
    };
}

var parameters = function (req, res, next){
    var data;

    if(!req.headers['content-type'] || req.headers['content-type'].toLowerCase() != "application/json"){
        logger.log("debug", "content-type not exist or not valid");
        return next(SsiErrors.ContentTypeInvalidError());
    }
    try{
        data = _extractDataForReq(req);
    }catch (error){
        logger.log("debug", "parameter parsing exception:" + error.name + " " + error.message);
        return next(SsiErrors.ParameterInvalidError("rest parameter parsing error"));
    }
    if(validate(data)){
        req.parameters = data;
        next();
    }else{
        logger.log("debug", "parameter not restful " + JSON.stringify(validate.errors));
        return next(SsiErrors.ParameterInvalidError("rest parameter parsing error"));
    }

};

module.exports = parameters;



