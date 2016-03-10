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
            "type" : "string",
            "enum" : [
                "true",
                "false"
            ]
        },
        "select" : {
            "type" : "array",
            "items" : {
                "type" : "string"
            }
        },
        "query" : {
            "type" : "object"
        },
        "populate" : {
            "type" : "array",
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
    var ret = {};
    if(req.query.select){
        ret.select = JSON.parse(req.query.select);
    }

    if(req.query.query){
        ret.query = JSON.parse(req.query.query);
    }

    if(req.query.populate){
        ret.pupulate = JSON.parse(req.query.populate);
    }

    if(req.query.overwrite){
        ret.overwrite = (req.query.overwrite == "true");
    }

    if(req.query.release){
        ret.release = (req.query.release == "true");
    }

    if(req.query.from){
        ret.from = req.query.from;
    }

    if(req.body){
        ret.data = req.body;
    }

    return ret;
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



