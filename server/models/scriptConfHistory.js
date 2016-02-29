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
        type : [String],
        required : true
    }
});

var scriptConfHistorySchema = new Schema({

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
        required : true
    },

    createBy : {
        type : String,
        default : ""
    },
});

var ScriptConfHistory = mongoose.model("scriptConfHistory", scriptConfHistorySchema);

module.exports = ScriptConfHistory;