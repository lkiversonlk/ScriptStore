/**
 * Created by jerry on 3/7/16.
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

var draftSchema = new Schema({

    creation : {
        type : Number,
        default : Date.now
    },

    adid : {
        type : String,
        required : true
    },

    name : {
        type :String,
        required : true
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

var draft = mongoose.model("draft", draftSchema);

module.exports = version;