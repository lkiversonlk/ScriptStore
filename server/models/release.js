/**
 * Created by jerry on 2/29/16.
 */

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var activeTriggerSchema = new Schema({
    r : {    //ruleType
        type : Number,
        required : true
    },
    o : {    //op
        type : Number,
        required : true
    },
    v : {    //value
        type : String,
        required : true
    }
}, {_id : false});

var activeTagSchema = new Schema({
    s : {             //script
        type : String,
        required : true
    },

    c : {    //conversions
        type : String
    },

    t : {         //triggers
        type : [activeTriggerSchema],
        default : []
    }
}, {_id : false});

var activeSchema = new Schema({

    v : {     //vid
        type : String,
        required : true
    },

    advid : {
        type : String,
        required : true
    },

    t : {   //tags
        type : [activeTagSchema],
        default : []
    }
});

activeSchema.index({advid : 1});

var release = mongoose.model("release", activeSchema);

module.exports = release;