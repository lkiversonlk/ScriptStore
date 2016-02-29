/**
 * Created by jerry on 2/29/16.
 */

var chai = require("chai");
should = chai.should();

var models = require("../server/models");

describe("mongoose model schema test", function(){

    describe("scriptConfActive", function(){

        it("one simple active script conf", function(done){
            var activeConf = new models.ScriptActive();
            activeConf.adid = "adid234";
            activeConf.hid = "tsetid";
            activeConf.creation = Date.now();
            activeConf.script = "console.log(\"hello world\");";
            activeConf.validate(function(error){
                should.not.exist(error, "script should be able to be created");
                done();
            });
        });

        it("adid is required", function(done){
            var activeConf = new models.ScriptActive();
            activeConf.hid = "tsetid";
            activeConf.creation = Date.now();
            activeConf.script = "console.log(\"hello world\");";
            activeConf.validate(function(error){
                should.exist(error);
                activeConf.adid = "testadid";
                activeConf.validate(function(error){
                    should.not.exist(error, "add adid should make the doc valid");
                    done();
                });
            });
        });

        it("hid is required", function(done){
            var activeConf = new models.ScriptActive();
            activeConf.adid = "adid234";
            activeConf.creation = Date.now();
            activeConf.script = "console.log(\"hello world\");";
            activeConf.validate(function(error){
                should.exist(error);
                activeConf.hid = "testhid";
                activeConf.validate(function(error){
                    should.not.exist(error, "add hid should make this doc valid");
                    done();
                });
            });
        });

        it("creation is required", function(done){
            var activeConf = new models.ScriptActive();
            activeConf.hid = "testhid";
            activeConf.adid = "adid234";
            activeConf.script = "console.log(\"hello world\");";
            activeConf.validate(function(error){
                should.exist(error);
                activeConf.creation = Date.now();
                activeConf.validate(function(error){
                    should.not.exist(error, "add creation should make this doc valid");
                    done();
                });

            });
        });


        it("script is required", function(done){
            var scriptConfitem = {};
            var activeConf = new models.ScriptActive();
            activeConf.adid = "adid234";
            activeConf.hid = "tsetid";
            activeConf.creation = Date.now();

            activeConf.validate(function(error){
                should.exist(error, "script item should be invalid");
                activeConf.script = "console.log(\"hello world\");";
                activeConf.validate(function(error){
                    should.not.exist(error, "add script should make it valid");
                    done();
                });
            });
        });
    });

    describe("scriptConfHistory", function(){

    });

    describe("trigger", function(){

    });
});