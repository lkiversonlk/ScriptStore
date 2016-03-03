/**
 * Created by jerry on 2/29/16.
 */

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var scriptActiveSchema = new Schema({
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

    script : {
        type : String,
        required : true
    },

    createBy : {
        type : String,
        default : ""
    },

    creation : {
        type : Number,
        default : Date.now
    }
});

var scriptActive = mongoose.model("scriptActive", scriptActiveSchema);

module.exports = scriptActive;