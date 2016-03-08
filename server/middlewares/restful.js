/**
 * Created by jerry on 3/2/16.
 */
var SsiErrors = require("../errors");
var logger = require("../log").getLogger("middleware.restful");

function RestfulRegistry(name){
    this.name = name;
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

/**
 *
 * @param deleteFunc
 */
RestfulRegistry.prototype.registerDelete = function(deleteFunc){
    this.delete = deleteFunc;
};

/*
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
*/



RestfulRegistry.prototype.serve = function(router){

    if(this.searchById){
        router.get("/" + this.name + "/:id", this.searchById);
    }

    if(this.search){
        router.get("/" + this.name, this.search);
    }

    if(this.updateById){
        router.put("/" + this.name + "/:id", this.updateById);
    }

    if(this.update){
        router.put("/" + this.name, this.update);
    }

    if(this.create){
        router.post("/" + this.name, this.create);
    }

    if(this.delete){
        router.delete("/" + this.name, this.delete);
    }
};

var registeredModels = [];

module.exports = RestfulRegistry;


