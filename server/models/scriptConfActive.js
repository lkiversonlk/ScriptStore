/**
 * Created by jerry on 2/29/16.
 */

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var TriggerRuleSchema = require("./trigger").TriggerRuleSchema;

var scriptUnitSchema = new Schema({
    trigger : {
        type : TriggerRuleSchema,
        required : true
    },

    script : {
        type : String,
        required : true
    }
});

var scriptConfActiveSchema = new Schema({
    adid : {
        type : String,
        required : true
    },

    description : {
        type : String,
        default : ""
    },

    hid : {
        type : String,
        required : true
    },

    scripts : {
        type : [scriptUnitSchema],
        default : []
    },

    createBy : {
        type : String,
        default : ""
    },

    creation : {
        type : Number,
        required : true
    }
});

var ScriptConfActive = mongoose.model("scriptConfActive", scriptConfActiveSchema);

module.exports = ScriptConfActive;