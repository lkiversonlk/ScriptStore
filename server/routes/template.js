/**
 * Created by liukan on 4/19/16.
 *
 *
 * there are 3 entries:
 *   1. standard
 *    standard is the basic script which should be put directly in advertiser's website
 *   2. dynamic
 *    for each dynamic type ("viewItem,  viewList, viewSearch, viewChannel..."
 *    there will be a template for rendering
 *
 * entry format:
 * standard:
 *   /template/standard/[js, as2, as3, img]
 *    return the corresponding version of the standard code
 *
 *   /template/template/[event]/[js, as2, as3, img]
 *    return the corresponding version of the version code
 */

var express = require("express"),
    router = express.Router();
var path = require("path");
var fs = require("fs");
var swig = require("swig");
var logger = require("../log").getLogger("routes.template");
var SErrors = require("../errors");

var templatePath = path.join(__dirname, "templates");

var categories = fs.readdirSync(templatePath);

function render(filePath, req, res, callback) {
    var fac = null;
    try {
        fac = swig.compileFile(filePath);
    }catch (error){
        logger.log("error", "template rendering error: " + error.message || error);
        return next(SErrors.PathInvalidError);
    }
    req.SsiData.result = fac(req.body);
    return next();
}

/**
 * fetch default data in /templates/[category]/default/[model]
 * @param category
 * @param type
 * @param model
 * @param callback
 */
function loadDefault(category, type, model, callback) {
    var defaultPath = path.join(templatePath, category, "default", model);
    fs.stat(defaultPath, function (err, stats) {
        if(err){
            logger.log("debug", "read data " + defaultPath + " failed: " + err.message);
            return return callback(err);
        }else{
            if(stats.isFile()){
                return fs.readFile(defaultPath, callback);
            } else {
                logger.log("debug", "read data " + defaultPath + " failed, this is not file");
                return callback(SErrors.LogicError("template default is not file"));
            }
        }
    })
}

/**
 * fetch data belong to /templates/[category]/[type]/[model]
 * @param category
 * @param type
 * @param model
 * @param callback
 */
function fetchData(category, type, model, callback) {
    var path = path.join(templatePath, category, type, model);

    fs.stat(path, function (err, stats) {
        if(err){
            //file not existed, find the default
            logger.log("debug", "read data " + path + " failed, load default");
            return loadDefault(category, type, model, callback);
        }else{
            if(stats.isFile()){
                return fs.readFile(path, callback);
            } else {
                logger.log("debug", path + " is not file, load default");
                return loadDefault(category, type, model, callback);
            }
        }
    })
}

/**
 * the templates folder path:
 * templates:
 *    /tags
 *       [as2, as3, img, js, ]
 *    /desc
 *       [as2, as3, img, js, default]
 *    /desc-eng
 *       [as2, as3, img, js, default]
 */
router.post('/:type/:model', function (req, res, next) {
    var type = req.params.type;     //js, as, as2, img
    var model = req.params.model;   //viewHome, view...

    var codePath = path.join(templatePath, "tags", type, model);

    var ret = {};

    async.map(
        categories,
        function (category, callback) {
            fetchData(category, type, model, function (err, data) {
                if(err){
                    logger.log("fail to load data of category " + category + ": " + err.message);
                    return callback();
                } else {
                    if(category == "tags"){
                        var fac = swig.compile(data);
                        ret[category] = fac(req.body);
                    }else{
                        ret[category] = data;
                    }
                    return callback();
                }
            })
        },
        function (err, results) {
            req.SsiData.Result = ret;
            return next();
        }
    );
});

module.exports = router;