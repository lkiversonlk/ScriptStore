/**
 * Created by jerry on 2/29/16.
 */

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var scriptUnitSchema = new Schema({
    script : {
        type : String,
        required : true
    },

    triggers : {
        type : [{
            type : String,
            ref : "trigger"
        }],
        required : true
    }
});

var scriptHistorySchema = new Schema({

    adid : {
        type : String,
        required : true
    },

    description : {
        type : String,
        default : ""
    },

    scripts : {
        type : [scriptUnitSchema],
        required : true
    },

    creation : {
        type : Number,
        default : Date.now
    },

    createBy : {
        type : String,
        default : ""
    },
});

var scriptHistory = mongoose.model("scriptConfHistory", scriptHistorySchema);

module.exports = scriptHistory;