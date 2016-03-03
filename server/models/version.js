/**
 * Created by jerry on 2/29/16.
 */

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var tagSchema = new Schema({
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

var versionSchema = new Schema({

    adid : {
        type : String,
        required : true
    },

    description : {
        type : String,
        default : ""
    },

    tags : {
        type : [tagSchema],
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

var version = mongoose.model("scriptConfHistory", versionSchema);

module.exports = version;