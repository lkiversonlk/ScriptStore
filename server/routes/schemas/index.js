/**
 * Created by jerry on 3/1/16.
 */

var create_version = require("./create_version");
var create_draft = require("./create_draft");
var jsen = require("jsen");

module.exports = {
    create_version : jsen(create_version),
    create_draft : jsen(create_draft)
};