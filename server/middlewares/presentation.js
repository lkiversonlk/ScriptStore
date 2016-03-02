/**
 * Created by jerry on 2/29/16.
 */

/*******************************************
 * presentation
 */
var SsiError = require("../errors");

function present(req, res, next){
    res.json({
        code : 0,
        data : req.SsiData.result
    });
}

function presentError(error, req, res, next){
    if(error instanceof SsiError.SsiError){
        res.json({
            code : error.code,
            data : error.message
        })
    }else{
        console.log("unknown error : " + error.message);
        res.json(SsiError.ServerError());
    }
}

module.exports = {
    present : present,
    presentError : presentError
};

