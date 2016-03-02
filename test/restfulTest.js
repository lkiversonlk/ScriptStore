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

    var restBasePath = "/script";

    var resources = ["trigger", "scriptActive", "scriptHistory"];

    resources.forEach(function (resource) {
        it(resource + " should be empty", function (done) {
            request(app)
                .get(restBasePath + "/" + resource)
                .expect(200)
                .expect("Content-Type", /json/)
                .end(function (err, res) {
                    if (err) done(err);
                    res.body.code.should.equal(0);
                    res.body.data.length.should.equal(0);
                    done();
                });

        });
    });

    var testId = "testid";

    resources.forEach(function (resource) {

        it(resource + " get by id " + testId + " should return null", function (done) {
            request(app)
                .get(restBasePath + "/" + resource + "/" + testId)
                .expect(200)
                .expect("Content-Type", /json/)
                .end(function (err, res) {
                    if (err) done(err);
                    res.body.code.should.equal(0);
                    should.not.exist(res.body.data);
                    done();
                });
        })
    });

    resources.forEach(function(resource){
        it("post without Content-Type:application/json is not allowed", function(done){
            request(app)
                .post(restBasePath + "/" + resource)
                .expect(200)
                .end(function(err, res){
                    if(err) done(err);

                })
        })
    });
});