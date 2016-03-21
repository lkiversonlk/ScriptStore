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
    }
}, {_id : false});

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

    conversion : {
        type : String
    }
}, {_id : false});

var draftSchema = new Schema({

    creation : {
        type : Number,
        required : true
    },

    advid : {
        type : String,
        required : true
    },

    triggers : {
        type : [triggerSchema],
        default : []
    },

    tags : {
        type : [tagSchema],
        default : []
    }
});

var draft = mongoose.model("draft", draftSchema);

module.exports = draft;