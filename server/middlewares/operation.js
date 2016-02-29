/**
 * Created by jerry on 2/29/16.
 */

var OPERRATION_DATA_KEY = "SSiOperation";
var OPERATION_KEY = "operation";
var MODEL_KEY = "model";
var DATA_KEY = "data";

function _oper(operation, model, data, callback){

}

function operation(req, res, next){

    if(req.Ssi){
        var ssiData = req.Ssi;
        var operationData = null;
        if(oprationData = ssiData[OPERRATION_DATA_KEY]){

            _oper(operationData[OPERATION_KEY], operationData[MODEL_KEY], operationData[DATA_KEY], function(error, ret){
                if(error){
                    next(error);
                }else{

                }
            });
        }else{

        }
    }else{
        next()
    }
}