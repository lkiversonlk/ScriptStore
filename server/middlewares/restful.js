/**
 * Created by jerry on 3/2/16.
 */

var jsen = require("jsen");
var SsiErrors = require("../errors");
var logger = require("../log").getLogger("middleware.restful");

var restDataSchema = {
    "type" : "object",
    "properties" : {
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
            "type" : "string",
            "enum" : [
                "true",
                "false"
            ]
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
        ret.overwrite = req.query.overwrite;
    }

    if(req.body){
        ret.data = req.body;
    }

    return ret;
}

function RestfulRegistry(name, dataPath){
    this.name = name;
    this.dataPath = dataPath ? dataPath : "restfulData";
};

/**
 *
 * @param searchFunc(req, res, next)
 */
RestfulRegistry.prototype.registerSearchById = function(searchById){
    this.searchById = searchById;
};

/**
 *
 * @param search(req, res, next)
 */
RestfulRegistry.prototype.registerSearch = function(search){
    this.search = search
}
/**
 *
 * @param createFunc(req, res, next)
 */
RestfulRegistry.prototype.registerCreate = function(create){
    this.create = create;
};

/**
 *
 * @param updateById(req, res, next)
 */
RestfulRegistry.prototype.registerUpdateById = function(updateById){
    this.updateById = updateById;
}
/**
 *
 * @param update(req, res, next)
 */
RestfulRegistry.prototype.registerUpdate = function(update){
    this.update = update;
};


RestfulRegistry.prototype.wrap = function(routerHandler){
    var self = this;
    return function (req, res, next){
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
            req[self.dataPath] = data;
            routerHandler(req, res, next);
        }else{
            logger.log("debug", "parameter not restful " + JSON.stringify(validate.errors));
            return next(SsiErrors.ParameterInvalidError("rest parameter parsing error"));
        }

    }
};

/**
 *
 * @param deleteFunc
 */
RestfulRegistry.prototype.registerDelete = function(deleteFunc){
    this.deleteFunc = deleteFunc;
};

RestfulRegistry.prototype.serve = function(router){

    if(this.searchById){
        router.get("/" + this.name + "/:id", this.wrap(this.searchById));
    }

    if(this.search){
        router.get("/" + this.name, this.wrap(this.search));
    }

    if(this.updateById){
        router.put("/" + this.name + "/:id", this.wrap(this.updateById));
    }

    if(this.update){
        router.put("/" + this.name, this.wrap(this.update));
    }

    if(this.create){
        router.post("/" + this.name, this.wrap(this.create));
    }
};

var registeredModels = [];

module.exports = RestfulRegistry;


