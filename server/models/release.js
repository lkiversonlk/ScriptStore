/**
 * Created by jerry on 2/29/16.
 */

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var activeTriggerSchema = new Schema({
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
        required : true
    }
}, {_id : false});

var activeTagSchema = new Schema({
    script : {
        type : String,
        required : true
    },

    conversion : {
        type : String
    },

    triggers : {
        type : [activeTriggerSchema],
        default : []
    }
}, {_id : false});

var activeSchema = new Schema({

    vid : {
        type : String,
        required : true
    },

    advid : {
        type : String,
        required : true
    },

    tags : {
        type : [activeTagSchema],
        default : []
    }
});

var release = mongoose.model("release", activeSchema);

module.exports = release;