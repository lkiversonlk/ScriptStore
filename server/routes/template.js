/**
 * Created by liukan on 4/19/16.
 */
var express = require("express"),
    router = express.Router();
var path = require("path");
var fs = require("fs");
var dots = require("dot");
var swig = require("swig");
var SErrors = require("../errors");

var templates = {};

var entris = [
    "standard",
    "action",
    "conversion"
];

var types = [
    "js",
    "img",
    "as2",
    "as3"
];

entris.forEach(function (entry) {
    types.forEach(function (type) {
       router.get("/" + entry + "/" + type, function (req, res, next) {
           if(!templates[entry]){
               templates[entry] = {}
           }
           if(!templates[entry][type]){
               var filePath = path.join(__dirname, "templates", type, entry);
               templates[entry][type] = swig.compileFile(filePath);
           }
           req.SsiData = {};
           req.SsiData.result = templates[entry][type](req.query);
           return next();
       })
    });
});

module.exports = router;