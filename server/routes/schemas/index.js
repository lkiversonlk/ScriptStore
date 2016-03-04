/**
 * Created by jerry on 3/1/16.
 */

var version = require("./version");
var jsen = require("jsen");

module.exports = {
    version : jsen(version)
};