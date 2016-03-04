/**
 * Created by jerry on 3/2/16.
 */

var request = require("supertest"),
    app = require("../app.js");

var mongoose = require("mongoose");
var chai = require("chai");
var should = chai.should();

var validTriggers = [
    {
        adid : "testadid1",
        description : "testTrigger1",
        createBy : "testUser",
        rules : [
            {
                ruleType : 0,
                op : 2,
                value : "testtrigger1"
            }
        ]
    },
    {
        adid : "testaid2",
        description : "testTrigger2",
        createBy : "testUser",
        rules : [
            {
                ruleType : 1,
                op : 3,
                value : "testtrigger2"
            }
        ]
    }
];
var triggerId1, triggerId2;

var validTags = [
    {
        script : "console.log('hello world');",
        triggers : []
    },
    {
        script : "alert('this is a test');",
        triggers : []
    }
];

var validVersions = [
    {
        adid : "testadid1",
        description : "",
        tags : [],
        createBy : ""
    },
    {
        adid : "testadid2",
        description : "",
        tags : [],
        createBy : ""
    }
];

describe("test restful interface", function(){
    before("clear the database", function(done){
        mongoose.connection.db.dropDatabase(done);
    });

    after("clear the database", function(done){
        mongoose.connection.db.dropDatabase(done);
    });

    var restBasePath = "/script";

    var resources = ["trigger", "active", "version"];

    resources.forEach(function (resource) {
        it(resource + " should be empty", function (done) {
            request(app)
                .get(restBasePath + "/" + resource)
                .set("Content-Type", "Application/json")
                .expect(200)
                .expect("Content-Type", /json/)
                .end(function (err, res) {
                    if (err) done(err);
                    res.body.code.should.equal(0, "ret code should be 0");
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
                    res.body.code.should.equal(4, "ret code should be 4");
                    //should.not.exist(res.body.data);
                    done();
                });
        })
    });

    resources.forEach(function (resource) {
        it("post " + resource + " without Content-Type:application/json is not allowed", function (done) {
            request(app)
                .post(restBasePath + "/" + resource)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    res.body.code.should.equal(2);
                    done();
                })
        })
    });



    describe.skip("trigger creation test", function () {
        it("try create invalid trigger", function (done) {
            var invalidTrigger = {
                adid : "testadid",
                description : "testTrigger",
                rules : [
                    {
                        ruleType : 0,
                        op : 2,
                        value : "test"
                    }
                ]
            };

            request(app)
                .post(restBasePath + "/trigger")
                .set("Content-Type", "Application/json")
                .send(invalidTrigger)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    res.body.code.should.equal(1);
                    done();
                });
        });



        it("create a valid trigger", function(done){
            request(app)
                .post(restBasePath + "/trigger")
                .set("Content-Type", "Application/json")
                .send(validTriggers[0])
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    res.body.code.should.equal(0);
                    triggerId1 = res.body.data._id;
                    done();
                });
        });



        it("we should be able to retrive the trigger", function(done){
            request(app)
                .get(restBasePath + "/trigger?select=[\"adid\", \"description\"]")
                .set("Content-Type", "Application/json")
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    res.body.code.should.equal(0, "ret code should be 0");
                    res.body.data.length.should.equal(1);
                    Object.keys(res.body.data[0]).length.should.equal(3);   //should only contain 3 properties

                    request(app)
                        .get(restBasePath + "/trigger/" + triggerId1 + "?select=[\"adid\", \"description\"]")
                        .set("Content-Type", "Application/json")
                        .expect(200)
                        .end(function (err, res) {
                            if (err) done(err);
                            res.body.code.should.equal(0, "ret code should be 0");
                            Object.keys(res.body.data).length.should.equal(3);   //should only contain 3 properties
                            done();
                        });
                });
        });

        it("create another trigger", function(done){
            request(app)
                .post(restBasePath + "/trigger")
                .set("Content-Type", "Application/json")
                .send(validTriggers[1])
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    res.body.code.should.equal(0);
                    triggerId2 = res.body.data._id;
                    request(app)
                        .get(restBasePath + "/trigger?select=[\"adid\", \"description\", \"creation\"]")
                        .set("Content-Type", "Application/json")
                        .expect(200)
                        .end(function(err, res){
                            if(err) done(err);
                            res.body.code.should.equal(0, "rect code should be 0");
                            res.body.data.length.should.equal(2, "now there should be 2 triggers");
                            done();
                        });

                });
        });
    });


    describe("version creation test", function(){
        it("create invalid version", function(done){
            //TODO: finish this test
            done();
        });

        it("create first version", function(done){
            validTags[0].triggers.push(triggerId1);
            validVersions[0].tags.push(validTags[0]);
            request(app)
                .post(restBasePath + "/version")
                .send(validVersions[0])
                .expect(200)
                .end(function(err, res){
                    if(err) done(err);
                    res.body.code.should.equal(0, "ret code should be 0");
                    done();
                });
        });

        it("now we can retrive this version", function(done){
            //TODO: finish this test
            done();

        });

        it("create anothre version", function(done){
            //TODO: finish this test
            done();

        });
    });

    describe("active version test", function(){

    });
});