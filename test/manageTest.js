/**
 * Created by jerry on 3/4/16.
 */

var request = require("supertest"),
    app = require("../app.js");

var mongoose = require("mongoose");
var chai = require("chai");
var should = chai.should();
var async = require("async");
var queryString = require("querystring");

var testadvid = "testAd";
var testDraft = null;
var testVersion = null;
var testRelease = null;
var currentVersions = null;
var cookieHead = "pycodeconf";

var basePath = "/manage";
var restBasePath = "/rest";

var testTrigger = {
    name : "testTrigger",
    ruleType : 2,
    op : 3,
    value : "hello"
};

var testTag = {
    name : "testTag",
    script : "console.log('hellworld');",
    triggers : [
        0
    ]
};


function getAll(advid, callback){
    var query = {
        advid : advid
    };
    request(app)
        .get(basePath + "?query=" + JSON.stringify(query))
        .set("Content-Type", "Application/json")
        .expect(200)
        .end(callback);
}

function getRelease(advid, callback){
    var query = {
        advid : advid
    };

    request(app)
        .get(restBasePath+"/release?query=" + JSON.stringify(query))
        .set("Content-Type", "Application/json")
        .expect(200)
        .end(callback);
}

function getDraft(advid, callback){
    var query = {
        advid : advid
    };

    request(app)
        .get(restBasePath+"/draft?query=" + JSON.stringify(query))
        .set("Content-Type", "Application/json")
        .expect(200)
        .end(callback);
}

function getVersions(advid, callback){
    var query = {
        advid : advid
    };

    request(app)
        .get(restBasePath+"/version?query=" + JSON.stringify(query))
        .set("Content-Type", "Application/json")
        .expect(200)
        .end(callback);
}

describe("test configuration interface", function(){

    after("clear database", function(done){
        async.each(
            ["draft", "release", "version"]
            , function(model, callback) {
                request(app)
                    .delete(restBasePath + "/" + model)
                    .set("Content-Type", "Application/json")
                    .expect(200)
                    .end(function (err, res) {
                        if (err) callback(err);
                        callback(null);
                    });
            },
            function(err){
                done(err);
            }
        );
    });

    describe("draft CURD", function(){
        it("create an empty draft", function(done){
            var query = {
                advid : testadvid
            };
            request(app)
                .get(basePath + "/export?query=" + JSON.stringify(query))
                .set("Content-Type", "Application/json")
                .expect(200)
                .end(function(err, res){
                    if(err) done(err);
                    res.body.code.should.equal(0, res.body.data);
                    testDraft = res.body.data;
                    testDraft.advid.should.equal(testadvid);
                    testDraft.triggers.length.should.equal(0);
                    testDraft.tags.length.should.equal(0);

                    var query = {
                        advid : testadvid
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
                            getVersions(testadvid, function(err, res){
                                if(err) done(err);
                                res.body.code.should.equal(0, res.body.data);
                                res.body.data.length.should.equal(0);
                                done();
                            })
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
                            //res.body.data.description.should.equal(testDraft.description, "description should be updated");
                            res.body.data.triggers[0].value.should.equal(testTrigger.value);
                            done();
                        });
                })
        });

        it("save the draft to version", function(done){
            var query = {
                advid : testadvid
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
                        .get(basePath + "/toversion?query="+JSON.stringify(query))
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
                advid : testadvid
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
                advid : testVersion.advid
            };

            request(app)
                .get(basePath+"/publish/version/" + testVersion._id + "?query=" + JSON.stringify(query))
                .set("Content-Type", "Application/json")
                .expect(200)
                .end(function(err, res){
                    if(err) done(err);
                    res.body.code.should.equal(0, res.body.data);
                    var query = {
                        advid : testadvid
                    };
                    request(app)
                        .get(restBasePath+"/release?query=" + JSON.stringify(query))
                        .set("Content-Type", "Application/json")
                        .expect(200)
                        .end(function(err, res){
                            if(err) done(err);
                            res.body.code.should.equal(0, res.body.data);
                            res.body.data.length.should.equal(1);
                            done();
                        });

                });
        });


        it("publish the draft", function(done){
            //first update the draft again
            testDraft.tags.push(testTag);
            request(app)
                .put(restBasePath + "/draft/" + testDraft._id)
                .set("Content-Type", "Application/json")
                .send(testDraft)
                .expect(200)
                .end(function(err, res){
                    if(err) done(err);
                    res.body.code.should.equal(0, res.body.data);
                    var query = {
                        advid : testadvid
                    };

                    request(app)
                        .get(basePath + "/publish/draft?query=" + JSON.stringify(query))
                        .set("Content-Type", "Application/json")
                        .expect(200)
                        .end(function(err, res){
                            if(err) done(err);
                            res.body.code.should.equal(0, res.body.data);
                            //before there is one draft with one trigger, one version with one trigger, one release empty
                            //after publish draft, there should be one draft with one trigger and one tag
                            //two version the latter has one trigger and one tag, one release with one tag
                            getAll(testadvid, function(err, res){
                                if(err) done(err);
                                res.body.code.should.equal(0, res.body.data);
                                currentVersions = res.body.data;
                                currentVersions.length.should.equal(3);
                                currentVersions[2].draft.should.equal(true);
                                currentVersions[2].tags.length.should.equal(1);
                                currentVersions[2].triggers.length.should.equal(1);
                                currentVersions[1].tags.length.should.equal(1);
                                currentVersions[1].triggers.length.should.equal(1);
                                currentVersions[0].tags.length.should.equal(0);
                                currentVersions[0].triggers.length.should.equal(1);
                                getRelease(testadvid, function(err, res){
                                    if(err) done(err);
                                    res.body.code.should.equal(0);
                                    res.body.data[0].t.length.should.equal(1);  //tags
                                    done();
                                });

                            });
                        });
                });
        });
    });

    describe("export test", function(){
        //we have one release, two version, and one draft
        it("export version 0 with overwirte", function(done){
            var query = {
                advid : testadvid
            };
            request(app)
                .get(basePath+"/export?query=" + JSON.stringify(query) + "&from=" + currentVersions[0]._id + "&overwrite=true")
                .set("Content-Type", "Application/json")
                .expect(200)
                .end(function(err, res){
                    if(err) done(err);
                    res.body.code.should.equal(0, res.body.data);
                    getDraft(testadvid, function(err, res){
                        if(err) done(err);
                        res.body.code.should.equal(0, res.body.data);
                        res.body.data[0].triggers.length.should.equal(1);
                        res.body.data[0].tags.length.should.equal(0);
                        getVersions(testadvid, function(err, res){
                            if(err) done(err);
                            res.body.code.should.equal(0, res.body.data);
                            res.body.data.length.should.equal(2);
                            done();
                        });
                    });
                });
        });

        it("export version 1 with overwrite", function(done){
            var query = {
                advid : testadvid
            };
            request(app)
                .get(basePath+"/export?query=" + JSON.stringify(query) + "&from=" + currentVersions[1]._id + "&overwrite=true")
                .set("Content-Type", "Application/json")
                .expect(200)
                .end(function(err, res){
                    if(err) done(err);
                    res.body.code.should.equal(0, res.body.data);
                    getDraft(testadvid, function(err, res){
                        if(err) done(err);
                        res.body.code.should.equal(0, res.body.data);
                        res.body.data[0].triggers.length.should.equal(1);
                        res.body.data[0].tags.length.should.equal(1);
                        getVersions(testadvid, function(err, res){
                            if(err) done(err);
                            res.body.code.should.equal(0, res.body.data);
                            res.body.data.length.should.equal(2);
                            done();
                        });
                    });
                });
        });

        it("export version 0 without overwrite", function(done){
            var query = {
                advid : testadvid
            };
            request(app)
                .get(basePath+"/export?query=" + JSON.stringify(query) + "&from=" + currentVersions[0]._id + "&overwrite=false")
                .set("Content-Type", "Application/json")
                .expect(200)
                .end(function(err, res){
                    if(err) done(err);
                    res.body.code.should.equal(0, res.body.data);
                    getDraft(testadvid, function(err, res){
                        if(err) done(err);
                        res.body.code.should.equal(0, res.body.data);
                        res.body.data[0].triggers.length.should.equal(1);
                        res.body.data[0].tags.length.should.equal(0);
                        getVersions(testadvid, function(err, res){
                            if(err) done(err);
                            res.body.code.should.equal(0, res.body.data);
                            res.body.data.length.should.equal(3);
                            done();
                        });
                    });
                });
        });

        it("export version 1 without overwrite", function(done){
            var query = {
                advid : testadvid
            };
            request(app)
                .get(basePath+"/export?query=" + JSON.stringify(query) + "&from=" + currentVersions[1]._id + "&overwrite=false")
                .set("Content-Type", "Application/json")
                .expect(200)
                .end(function(err, res){
                    if(err) done(err);
                    res.body.code.should.equal(0, res.body.data);
                    getDraft(testadvid, function(err, res){
                        if(err) done(err);
                        res.body.code.should.equal(0, res.body.data);
                        res.body.data[0].triggers.length.should.equal(1);
                        res.body.data[0].tags.length.should.equal(1);
                        getVersions(testadvid, function(err, res){
                            if(err) done(err);
                            res.body.code.should.equal(0, res.body.data);
                            res.body.data.length.should.equal(4);
                            done();
                        });
                    });
                });
        });
    });

    describe("cookie test", function(){
        var query = {
            advid : testadvid
        };

        it("debug draft", function(done){
            request(app)
                .get(basePath + "/debug/draft?query=" + JSON.stringify(query))
                .set("Content-Type", "Application/json")
                .expect(200)
                .end(function(err, res){
                    if(err){
                        done(err);
                    }else{
                        var cookies = res.headers['set-cookie'];
                        cookies.forEach(function(cookie){
                            if(cookie.substr(0, cookieHead.length) == cookieHead){
                                var end = cookie.indexOf(";");
                                var text = queryString.unescape(cookie.substr(cookieHead.length + 1 , end - cookieHead.length - 1));
                                var textJson = JSON.parse(text);
                                textJson[testadvid].should.equal("");
                                done();
                            }
                        })

                    }

                });
        });

        var testVersionId = "testVersion";

        it("debug version", function(done){

            request(app)
                .get(basePath + "/debug/version/" + testVersionId + "?query=" + JSON.stringify(query))
                .set("Content-Type", "Application/json")
                .expect(200)
                .end(function(err, res){
                    if(err){
                        done(err);
                    }else{
                        var cookies = res.headers['set-cookie'];
                        cookies.forEach(function(cookie){
                            if(cookie.substr(0, cookieHead.length) == cookieHead){
                                var end = cookie.indexOf(";");
                                var text = queryString.unescape(cookie.substr(cookieHead.length + 1 , end - cookieHead.length - 1));
                                var textJson = JSON.parse(text);
                                textJson[testadvid].should.equal(testVersionId);
                                done();
                            }
                        })
                    }
                });
        });
    });
});