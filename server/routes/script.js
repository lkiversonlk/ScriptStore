var express = require('express');
var router = express.Router();
var middlewares = require("../middlewares");
var SsiErrors = require("../errors");
var schemas = require("./schemas");

function composeOperation(opertaion, model, data){
    return {
        operation : opertaion,
        model : model,
        data : data
    }
}

router.use(function(req, res, next){
    req.SsiData = {};
    next();
});

/**
 * get current active script by adid
 */
router.get('/', function(req, res, next) {
    if(req.query.adid){
        req.SsiData.SsiOperation = composeOperation('get', 'scriptActive', { adid : req.query.adid});
        next();
    }else{
        next(SsiErrors.ParameterInvalidError("adid is required"));
    }
});

/**
 * get script configuration history by id
 */
router.get('/history', function(req, res, next){
    if(req.query.id){
        req.SsiData.SsiOperation = composeOperation('get', 'scriptHistory', { id : req.query.id});
        next();
    }else{
        next(SsiErrors.ParameterInvalidError("id is required"));
    }
});

/**
 * get script configuration list
 */
router.get('/list', function(req, res, next){
    req.SsiData.SsiOperation = composeOperation('list', 'scriptHistory', {});
    next();
});

/**
 * activate specified script configuration
 */
router.get("/active", function(req, res, next){
    if(req.query.hid){
        req.SsiData.SsiOperation = composeOperation('active', 'scriptHistory', {id : req.param.hid});
        next();
    }else{
        next(SsiErrors.ParameterInvalidError("hid is required"));
    }
});

/**
 *
 */
router.post("/create/:model", function(req, res, next){
    var model = req.params.model;
    var data = req.body;
    if(schemas.hasOwnProperty(model)){
        if(schemas[model](data)){
            console.log("valid data");
            res.send("hello");
        }else{
            next(SsiErrors.ParameterInvalidError("invalid data"));
        }
    }else{
        next(SsiErrors.ParameterInvalidError(model + " is not valid"));
    }
});

router.use(middlewares.operation);
router.use(middlewares.presentation.present);
//router.use(middlewares.presentation.presentError);

module.exports = router;
