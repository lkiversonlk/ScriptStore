/**
 * Created by jerry on 2/29/16.
 */

/*******************************************
 * presentation
 */
var SsiError = require("../errors");
var logger = require("../log").getLogger("middlewares.presentation");
function present(req, res, next){
    res.json({
        code : 0,
        data : req.SsiData.result
    });
}

function presentError(error, req, res, next){
    if(error instanceof SsiError.SsiError){
        logger.log("debug", "error code " + error.code + " message " + error.message);
        res.json({
            code : error.code,
            data : error.message
        })
    }else{
        console.log("error", "unknown error : " + error.message);
        console.log(error.stack);
        res.json(SsiError.ServerError());
    }
}

module.exports = {
    present : present,
    presentError : presentError
};

