/**
 * Created by jerry on 3/1/16.
 */

var trigger = require("./trigger.json");
var scriptHistory = require("./scriptHistory");
var jsen = require("jsen");

module.exports = {
    trigger : jsen(trigger),
    scriptHistory : jsen(scriptHistory)
};