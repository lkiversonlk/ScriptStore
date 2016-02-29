/**
 * Created by jerry on 2/29/16.
 */

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var triggerRuleSchema = new Schema({
    ruleType : {
        type : Number,
        required : true
    },

    op : {
        type : Number,
        required : true
    },

    value : {
        type : String,
        required :true
    }

});

var triggerSchema = new Schema({

    adid : {
        type : String,
        required : true
    },

    description : {
        type : String,
        default : ""
    },

    rules : {
        type : [triggerRuleSchema],
        required : true
    },

    createBy : {
        type : String,
        default : ""
    },

    creation : {
        type : Number,
        default : Date.now()
    }
});

var Trigger = mongoose.model("trigger", triggerSchema);

module.exports.Trigger = Trigger;
module.exports.TriggerRuleSchema = triggerRuleSchema;