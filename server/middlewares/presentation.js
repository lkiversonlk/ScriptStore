/**
 * Created by jerry on 2/29/16.
 */

/*******************************************
 * presentation
 */

function present(req, res, next){
    res.json({
        code : 0,
        data : req.SsiData.result
    });
}

function presentError(error, req, res, next){
    res.json()
}

module.exports = {
    present : present,
    presentError : presentError
};

