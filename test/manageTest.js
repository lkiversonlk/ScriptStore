/**
 * Created by jerry on 3/4/16.
 */



var request = require("supertest"),
    app = require("../app.js");

var mongoose = require("mongoose");
var chai = require("chai");
var should = chai.should();




var testAdid = "testAd";
var testDraft = null;
var testVersion = null;
var testRelease = null;
var basePath = "/manage";
var restBasePath = "/rest";

var testTrigger = {
    name : "testTrigger",
    ruleType : 2,
    op : 3,
    value : "hello"
};

describe("test configuration interface", function(){
    describe("draft CURD", function(){
        it("create an empty draft", function(done){
            request(app)
                .get(basePath + "/export?adid=" + testAdid)
                .set("Content-Type", "Application/json")
                .expect(200)
                .end(function(err, res){
                    if(err) done(err);
                    res.body.code.should.equal(0, res.body.data);
                    testDraft = res.body.data;
                    testDraft.adid.should.equal(testAdid);
                    testDraft.name.should.equal("");
                    testDraft.description.should.equal("");
                    testDraft.triggers.length.should.equal(0);
                    testDraft.tags.length.should.equal(0);

                    var query = {
                        adid : testAdid
                    };
                    request(app)
                        .get(restBasePath + "/draft?query=" + JSON.stringify(query))
                        .set("Content-Type", "Application/json")
                        .expect(200)
                        .end(function(err, res){
                            if(err){
                                done(err);
                            }
                            res.body.code.should.equal(0, res.body.data);
                            //res.body.data.should.be.a("")
                            res.body.data.length.should.equal(1);
                            res.body.data[0]._id.should.equal(testDraft._id);
                            done();
                        });

                });
        });

        it("update the draft", function (done) {
            testDraft.description = "this is a test draft";
            testDraft.triggers.push(testTrigger);
            request(app)
                .put(restBasePath + "/draft/" + testDraft._id)
                .set("Content-Type", "Application/json")
                .send(testDraft)
                .expect(200)
                .end(function(err, res){
                    if(err) done(err);
                    res.body.code.should.equal(0, res.body.data);
                    request(app)
                        .get(restBasePath + "/draft/" + testDraft._id)
                        .set("Content-Type", "Application/json")
                        .expect(200)
                        .end(function(err, res){
                            if(err){
                                done(err);
                            }
                            res.body.code.should.equal(0, res.body.data);
                            res.body.data.description.should.equal(testDraft.description, "description should be updated");
                            res.body.data.triggers[0].value.should.equal(testTrigger.value);
                            done();
                        });
                })
        });

        it("save the draft to version", function(done){
            var query = {
                adid : testAdid
            };

            request(app)
                .get(restBasePath + "/version?query=" + JSON.stringify(query))
                .set("Content-Type", "Application/json")
                .expect(200)
                .expect("Content-Type", /json/)
                .end(function (err, res) {
                    if (err) done(err);
                    res.body.code.should.equal(0, res.body.data);
                    var currentVersions = res.body.data.length;
                    request(app)
                        .get(basePath + "/toVersion/" + testDraft._id)
                        .set("Content-Type", "Application/json")
                        .expect(200)
                        .end(function (err, res) {
                            if (err) done(err);
                            res.body.code.should.equal(0, res.body.data);
                            request(app)
                                .get(restBasePath + "/version?query=" + JSON.stringify(query))
                                .set("Content-Type", "Application/json")
                                .expect(200)
                                .expect("Content-Type", /json/)
                                .end(function (err, res) {
                                    if (err) done(err);
                                    res.body.code.should.equal(0, res.body.data);
                                    res.body.data.length.should.equal(currentVersions + 1);
                                    testVersion = res.body.data[0];
                                    res.body.data[0].triggers[0].value.should.equal(testTrigger.value);
                                    done();
                                });

                        });
                });
        });

        it("get configurations of test advertiser", function(done){
            var query = {
                adid : testAdid
            };
            request(app)
                .get(basePath + "?query=" + JSON.stringify(query))
                .set("Content-Type", "Application/json")
                .expect(200)
                .end(function(err, res){
                    if(err) done(err);
                    res.body.code.should.equal(0, res.body.data);
                    res.body.data.length.should.equal(2);
                    done();
                });
        });

        it("publish the first version", function(done){
            var query = {
                adid : testVersion.adid,
                _id : testVersion._id
            };

            request(app)
                .get(basePath+"/publish/version?query=" + JSON.stringify(query))
                .set("Content-Type", "Application/json")
                .expect(200)
                .end(function(err, res){
                    if(err) done(err);
                    res.body.code.should.equal(0, res.body.data);
                    var query = {
                        adid : testAdid
                    };
                    request(app)
                        .get(restBasePath+"/release?query=" + JSON.stringify(query))
                        .set("Content-Type", "Application/json")
                        .expect(200)
                        .end(function(err, res){
                            if(err) done(err);
                            res.body.code.should.equal(0, res.body.data);

                            done();
                        });

                });
        });
    })
});