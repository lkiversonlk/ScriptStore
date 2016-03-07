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
var basePath = "/configuration";

describe("test configuration interface", function(){

    /*
    before("clear the database", function(done){
        mongoose.connection.db.dropDatabase(done);
    });

    after("clear the database", function(done){
        mongoose.connection.db.dropDatabase(done);
    });
    */

    describe("draft CURD", function(){
        it("create an empty draft for ad " + testAdid, function(done){
            request(app)
                .get(basePath + "/export?adid=" + testAdid)
                .expect(200)
                .end(function(err, res){
                    if(err) done(err);
                    res.body.code.should.equal(0, "ret code should be 0");
                    testDraft = res.body.data;
                    done();
                });
        });

        it("update the draft", function (done) {
            testDraft.description = "this is a test draft";
            request(app)
                .put(basePath + "/draft")
                .send(testDraft)
                .expect(200)
                .end(function(err, res){
                    if(err) done(err);
                    res.body.code.should.equal(0, "ret code should be 0");
                    res.body.data.description.should.equal(testDraft.description);
                    done();
                })
        });

        it("publish the draft", function(done){
            request(app)
                .get(basePath + "/publish?adid=" + testAdid)
                .expect(200)
                .end(function(err, res){
                    if(err) done(err);
                    res.body.code.should.equal(0, "ret code should be 0");
                    done();
                });
        });
    })
});