/**
 * Created by jerry on 2/29/16.
 */

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var triggerSchema = new Schema({
    name : {
        type : String,
        required : true
    },

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
    },

    deleted : {
        type : Boolean,
        default : false
    }
});

var tagSchema = new Schema({
    name : {
        type : String,
        required : true
    },

    script : {
        type : String,
        required : true
    },

    triggers : {
        type : [{
            type : Number
        }],
        default : []
    },

    deleted : {
        type : Boolean,
        default : false
    }
});

var versionSchema = new Schema({

    creation : {
        type : Number,
        required : true
    },

    adid : {
        type : String,
        required : true
    },

    name : {
        type :String,
        default : ""
    },

    description : {
        type : String,
        default : ""
    },

    triggers : {
        type : [triggerSchema],
        default : []
    },

    tags : {
        type : [tagSchema],
        default : []
    },

    deleted : {
        type : Boolean,
        default : false
    }
});

var version = mongoose.model("version", versionSchema);

module.exports = version;