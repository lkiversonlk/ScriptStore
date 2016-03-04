/**
 * Created by jerry on 2/29/16.
 */

var chai = require("chai");
should = chai.should();

var models = require("../server/models");

describe("mongoose model schema test", function(){

    describe.skip("active", function(){

        it("one simple active script conf", function(done){
            var activeConf = new models.active();
            activeConf.adid = "adid234";
            activeConf.vid = "tsetid";
            activeConf.creation = Date.now();
            activeConf.script = "console.log(\"hello world\");";
            activeConf.validate(function(error){
                should.not.exist(error, "script should be able to be created");
                done();
            });
        });

        it("adid is required", function(done){
            var activeConf = new models.active();
            activeConf.vid = "tsetid";
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

        it("vid is required", function(done){
            var activeConf = new models.active();
            activeConf.adid = "adid234";
            activeConf.creation = Date.now();
            activeConf.script = "console.log(\"hello world\");";
            activeConf.validate(function(error){
                should.exist(error);
                activeConf.vid = "testhid";
                activeConf.validate(function(error){
                    should.not.exist(error, "add vid should make this doc valid");
                    done();
                });
            });
        });

        it("creation will be created automatically", function(done){
            var activeConf = new models.active();
            activeConf.vid = "testhid";
            activeConf.adid = "adid234";
            activeConf.script = "console.log(\"hello world\");";
            activeConf.validate(function(error){
                should.not.exist(error);
                done();
            });
        });


        it("script is required", function(done){
            var scriptConfitem = {};
            var activeConf = new models.active();
            activeConf.adid = "adid234";
            activeConf.vid = "tsetid";
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

    describe("version", function(){

    });

    describe("trigger", function(){

    });
});