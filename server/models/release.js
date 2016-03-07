/**
 * Created by jerry on 2/29/16.
 */

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var activeTagSchema = new Schema({
    script : {
        type : String,
        required : true
    },

    triggers : {
        type : [{
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
        }],
        default : []
    }
});

var activeSchema = new Schema({

    vid : {
        type : String,
        required : true
    },

    adid : {
        type : String,
        required : true
    },

    tags : {
        type : [activeTagSchema],
        default : []
    }
});

var active = mongoose.model("active", activeSchema);

module.exports = active;