/**
 * Created by jerry on 3/2/16.
 */

var request = require("supertest"),
    app = require("../app.js");

var mongoose = require("mongoose");
var chai = require("chai");
var should = chai.should();

describe("test restful interface", function(){
    before("clear the database", function(done){
        mongoose.connection.db.dropDatabase(done);
    });

    after("clear the database", function(done){
        mongoose.connection.db.dropDatabase(done);
    });

    var restBasePath = "/script";

    var resources = ["trigger", "scriptActive", "scriptHistory"];

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



    describe("trigger creation test", function () {
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

        var validTrigger = {
            adid : "testadid",
            description : "testTrigger",
            createBy : "testUser",
            rules : [
                {
                    ruleType : 0,
                    op : 2,
                    value : "test"
                }
            ]
        };

        it("create a valid trigger", function(done){
            request(app)
                .post(restBasePath + "/trigger")
                .set("Content-Type", "Application/json")
                .send(validTrigger)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    res.body.code.should.equal(0);
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

                    var trigger = res.body.data[0];

                    request(app)
                        .get(restBasePath + "/trigger/" + trigger._id + "?select=[\"adid\", \"description\"]")
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
    });
});