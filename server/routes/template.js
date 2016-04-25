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

function render(filePath, req, res, next) {
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

router.post('/standard/:type', function (req, res, next) {
    var filePath = path.join(templatePath, req.params.type, "standard");
    render(filePath, req, res, next);
});

router.post('/event/:event/:type', function (req, res, next) {
    var filePath = path.join(templatePath, req.params.type, req.params.event);
    render(filePath, req, res, next);
});

module.exports = router;