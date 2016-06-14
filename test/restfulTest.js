/**
 * Created by jerry on 3/2/16.
 */

var request = require("supertest"),
    app = require("../app.js");
var mongoose = require("mongoose");
var chai = require("chai");
var should = chai.should();
var async = require("async");

var adids = [
    "adid1",
    "adid2",
    "adid3"
];

var validTriggers = [
    {
        name : "testTrigger1",
        ruleType : 0,
        op : 2,
        value : "testtrigger1"
    },
    {
        name : "testTrigger2",
        ruleType : 1,
        op : 3,
        value : "testtrigger2"
    }
];

var validTags = [
    {
        name : "tag1",
        script : "console.log('hello world');",
        triggers : [0, 1]
    },
    {
        name : "tag2",
        script : "alert('this is a test');",
        triggers : [1]
    }
];

var validVersions = [
    {
        advid : "testadid1",
        name : "version1",
        description : "",
        triggers : validTriggers,
        tags : validTags,
        createBy : ""
    },
    {
        advid : "testadid2",
        name : "version2",
        triggers : validTriggers,
        tags : validTags,
        createBy : ""
    }
];

var versionIds = [

];

describe("test restful interface", function(){
    var restBasePath = "/rest";

    var resources = ["version", "draft", "release"];

    before("clear database", function(done){
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

    resources.forEach(function (resource) {
        it(resource + " should be empty", function (done) {
            request(app)
                .get(restBasePath + "/" + resource)
                .set("Content-Type", "Application/json")
                .expect(200)
                .expect("Content-Type", /json/)
                .end(function (err, res) {
                    if (err) done(err);
                    res.body.code.should.equal(0, res.body.data);
                    res.body.data.length.should.equal(0);
                    done();
                });

        });
    });


    var testId = "testid";

    resources.forEach(function (resource) {

        it(resource + " get by invalid id " + testId + " should return DBOperationError", function (done) {
            request(app)
                .get(restBasePath + "/" + resource + "/" + testId)
                .set("Content-Type", "Application/json")
                .expect(200)
                .expect("Content-Type", /json/)
                .end(function (err, res) {
                    if (err) done(err);
                    res.body.code.should.equal(4, res.body.data);
                    //should.not.exist(res.body.data);
                    done();
                });
        })
    });

    resources.forEach(function (resource) {
        it.skip("post " + resource + " without Content-Type:application/json is not allowed", function (done) {
            request(app)
                .post(restBasePath + "/" + resource)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    res.body.code.should.equal(2, res.body.data);
                    done();
                })
        })
    });

    describe("version CURD test", function(){
        it("create invalid version", function(done){
            request(app)
                .post(restBasePath + "/version")
                .set("Content-Type", "Application/json")
                .send({test: "nothing"})
                .expect(200)
                .end(function(err, res){
                    if(err) done(err);
                    res.body.code.should.equal(1, res.body.data);
                    done();
                });
        });

        it("create first version", function(done){
            request(app)
                .post(restBasePath + "/version")
                .send(validVersions[0])
                .expect(200)
                .end(function(err, res){
                    if(err) done(err);
                    res.body.code.should.equal(0, res.body.data);
                    done();
                });
        });

        it("now we can retrive this version", function(done){
            request(app)
                .get(restBasePath + "/version?select=[\"adid\"]")
                .set("Content-Type", "Application/json")
                .expect(200)
                .end(function(err, res){
                    if(err) done(err);
                    res.body.code.should.equal(0, res.body.data);
                    res.body.data.length.should.equal(1);
                    var vid = res.body.data[0]._id;
                    versionIds.push(vid);
                    request(app)
                        .get(restBasePath + "/version/" + vid)
                        .set("Content-Type", "Application/json")
                        .expect(200)
                        .end(function(err, res){
                            if(err) done(err);
                            res.body.code.should.equal(0, "ret code should be 0");
                            done();
                        });
                });
        });

        /*
        it("update the version we just created", function(done){
            var modifiedAdid = "testAntherAdid";
            request(app)
                .put(restBasePath+"/version/" + versionIds[0])
                .set("Content-Type", "Application/json")
                .send({adid : modifiedAdid})
                .expect(200)
                .end(function(err, res){
                    if(err) done(err);
                    res.body.code.should.equal(0, "ret code should be 0");
                    request(app)
                        .get(restBasePath + "/version/" + versionIds[0])
                        .set("Content-Type", "Application/json")
                        .expect(200)
                        .end(function(err, res){
                            if(err) done(err);
                            res.body.code.should.equal(0, "ret code should be 0");
                            res.body.data.adid.should.equal(modifiedAdid, "adid should be modified")
                            done();
                        });
                })
        });
        */
    });
});