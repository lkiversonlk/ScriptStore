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
var async = require("async");
var templatePath = path.join(__dirname, "templates");

var categories = [
    "desc",
    "desc_en"
];

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
            return callback(err);
        }else{
            if(stats.isFile()){
                return fs.readFile(defaultPath, 'utf8', callback);
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
    var dataPath = path.join(templatePath, category, type, model);

    fs.stat(dataPath, function (err, stats) {
        if(err){
            //file not existed, find the default
            logger.log("debug", "read data " + dataPath + " failed, load default");
            return loadDefault(category, type, model, callback);
        }else{
            if(stats.isFile()){
                return fs.readFile(dataPath, 'utf8', callback);
            } else {
                logger.log("debug", dataPath + " is not file, load default");
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
 *       
 */
router.post('/:type/:class/:model', function (req, res, next) {
    var type = req.params.type;     //js, as, as2, img
    var model = req.params.model;   //viewHome, view...
    var cls = req.params.class;
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
                    ret[category] = data;
                    return callback();
                }
            })
        },
        function (err, results) {
            var tagsPath = path.join(templatePath, "tags", type, cls, model);
            try{
                ret["tags"] = swig.compileFile(tagsPath)(req.body);
            }catch (error){
                logger.log("error", "fail to render " + tagsPath + ": " + error.message);
            }
            req.SsiData.result = ret;
            return next();
        }
    );
});

module.exports = router;