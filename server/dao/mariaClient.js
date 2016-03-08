/**
 * Created by jerry on 3/8/16.
 */

var Client = require("mariasql");

function MariaClient(config) {
    var self = this;
    self.client = new Client(config);
    self.init();
}

MariaClient.prototype.init = function(){
    var self = this;
    self.selectAdverNameIdQuery = self.client.prepare('SELECT name, id FROM advertiser');
};

MariaClient.prototype.selectAdverNameId = function(callback){
    var self = this;
    self.client.query(self.selectAdverNameIdQuery(), callback);
};

module.exports = MariaClient;