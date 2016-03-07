/**
 * Created by jerry on 3/7/16.
 */

function SsiData(){
    this.operations = [];
}

SsiData.prototype.addOperations = function(operations){
    var self = this;
    if(Array.isArray(operations)){
        self.operations = self.operations.concat(operations);
    }else{
        self.operations.push(operations);
    }
};

module.exports = SsiData;