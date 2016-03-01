var express = require('express');
var router = express.Router();
var middlewares = require("../middlewares");

function composeOperation(opertaion, model, data){
    return {
        operation : opertaion,
        model : model,
        data : data
    }
}
/**
 * get current active script
 */
router.get('/', function(req, res, next) {
    req.SsiData = {};
    if(req.query.adid){
        req.SsiData.SsiOperation = composeOperation('get', 'scriptActive', { adid : req.query.adid});
        next();
    }else{
        next(new Error("adid missing"));
    }
});

/**
 * get script configuration history
 */
router.get('/history', function(req, res, next){

});

/**
 * get script configuration list
 */
router.get('/list', function(req, res, next){

});

/**
 * activate specified script configuration
 */
router.get("/active", function(req, res, next){

});

/**
 *
 */
router.post("/create", function(req, res, next){

});

router.use(middlewares.operation);
router.use(middlewares.presentation.present);

module.exports = router;
