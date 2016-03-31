/**
 * Created by jerry on 3/17/16.
 */

var request = require("supertest"),
    app = require("../app.js");
var versions = require("./data").versions;

var mongoose = require("mongoose");
var chai = require("chai");
var should = chai.should();
var async = require("async");
var queryString = require("querystring");

var cookieHead = "pycodeconf";
var testadvid = "testadvid";
var releaseKeys = 4;
var releaseTagKeys = 3;
var versionKeys = 10;
var versionTagKeys = 4;
var draftKeys = 6;
var draftTagKeys = 4;

function getRelease(advid, callback){
    var query = {
        advid : advid
    };

    request(app)
        .post("/manage/release?query=" + JSON.stringify(query))
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

function getVersions(advid, id, callback){
    var query = {
        advid : advid
    };

    request(app)
        .get(restBasePath+"/version/" + id + "?query=" + JSON.stringify(query))
        .set("Content-Type", "Application/json")
        .expect(200)
        .end(callback);
}

function get(url, done, callback){
    request(app)
        .get(url)
        .set("Content-Type", "Application/json")
        .expect(200)
        .end(function(err, res){
            if(err){
                done(err);
            }else{
                callback(res);
            }
        });
}

function getWithCookie(url, cookie, done, callback){
    request(app)
        .get(url)
        .set("Content-Type", "Application/json")
        .set("Cookie", cookie)
        .expect(200)
        .end(function(err, res){
            if(err){
                done(err);
            }else{
                callback(res);
            }
        });
}

var query = JSON.stringify({advid : testadvid});

function method(method, url, data, done, callback){
    request(app)
        [method](url)
        .set("Content-Type", "Application/json")
        .send(data)
        .expect(200)
        .end(function(err, res){
            if(err){
                done(err);
            }else{
                callback(res);
            }
        });
}

function versionValid(data, version){
    //data.description.should.equal(version.description);
    data.advid.should.equal(version.advid);
    Object.keys(data).length.should.equal(versionKeys);
    data.tags.length.should.equal(version.tags.length);

    data.tags.forEach(function(tag, i){
        Object.keys(tag).length.should.equal(draftTagKeys);
        tag.script.should.equal(version.tags[i].script);
        tag.conversion.should.equal(version.tags[i].conversion);
        tag.name.should.equal(version.tags[i].name);
        tag.triggers.length.should.equal(version.tags[i].triggers.length);
    });
    //data.creation.should.equal(version.creation);
    data.triggers.length.should.equal(version.triggers.length);
    data.triggers.forEach(function(trigger, i){
        trigger.ruleType.should.equal(version.triggers[i].ruleType);
        trigger.value.should.equal(version.triggers[i].value);
        trigger.op.should.equal(version.triggers[i].op);
        trigger.name.should.equal(version.triggers[i].name);
    });
};

function draftValid(data, version){
    //data.name.should.equal(version.name);
    //data.description.should.equal(version.description);
    data.advid.should.equal(version.advid);
    Object.keys(data).length.should.equal(draftKeys);
    data.tags.length.should.equal(version.tags.length);

    data.tags.forEach(function(tag, i){
        Object.keys(tag).length.should.equal(draftTagKeys);
        tag.script.should.equal(version.tags[i].script);
        tag.conversion.should.equal(version.tags[i].conversion);
        tag.name.should.equal(version.tags[i].name);
        tag.triggers.length.should.equal(version.tags[i].triggers.length);
    });
    //data.creation.should.equal(version.creation);
    data.triggers.length.should.equal(version.triggers.length);
    data.triggers.forEach(function(trigger, i){
        trigger.ruleType.should.equal(version.triggers[i].ruleType);
        trigger.value.should.equal(version.triggers[i].value);
        trigger.op.should.equal(version.triggers[i].op);
        trigger.name.should.equal(version.triggers[i].name);
    });
};

function releaseValid(data, version, keys){
    if(!keys) keys = releaseKeys;
    Object.keys(data).length.should.equal(keys);
    data.t.forEach(function(tag, i){  //tags
        Object.keys(tag).length.should.equal(releaseTagKeys);
        tag.s.should.equal(version.tags[i].script);   //script
        tag.c.should.equal(version.tags[i].conversion);  //conversion
        tag.t.forEach(function(trigger, j){   //triggers
            trigger.r.should.equal(version.triggers[version.tags[i].triggers[j]].ruleType);  //ruleType
            trigger.v.should.equal(version.triggers[version.tags[i].triggers[j]].value);    //value
            trigger.o.should.equal(version.triggers[version.tags[i].triggers[j]].op);       //op
        });
    });
}
/**
 * interface that tested :
 *
 * * GET /manage/export       done
 * * PUT /rest/draft          done
 * * GET /rest/draft          done
 * * GET /manage/publish/draft  done
 * * POST /manage/release  done
 * * GET /manage/toversion done
 * * GET /manage/publish/version done
 * * GET /manage/export?from overwrite=true done
 * * GET /manage/export?from overwrite=false done
 * * GET /manage done
 * * GET /manage/debug/draft done
 * * GET /manage/release done
 * * GET /manage/debug/version done
 * * GET /manage/release done
 * * GET /manage/undebug/ done
 * * GET /manage/release done
 */
describe("manage test suite", function(){
    after("clear database", function(done){
        async.each(
            ["draft", "release", "version"]
            , function(model, callback) {
                request(app)
                    .delete("/rest/" + model)
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

    var creation1;
    var startTime = Date.now();

    /**
     * Empty
     */
    it("create first draft", function(done){
        get("/manage/export?query=" + query, done, function(res){
            res.body.code.should.equal(0, res.body.data);
            res.body.data.creation.should.be.above(startTime);
            creation1 = res.body.data.creation;
            done();
        });
    });

    var versiondata1 = versions[0];

    /**
     * Draft : emptydraft
     */
    it("update the draft", function(done){
        versiondata1.advid = testadvid;
        method("put", "/rest/draft?query=" + query, versiondata1, done, function(res){
            res.body.code.should.equal(0, res.body.data);
            done();
        });
    });

    var draft1 = null;

    /**
     *  Draft : versiondata1
     */
    it("check the draft", function(done){
        get("/rest/draft?query=" + query, done, function(res){
            res.body.code.should.equal(0, res.body.data);
            res.body.data.length.should.equal(1);
            draft1 = res.body.data[0];

            draftValid(draft1, versiondata1);
            draft1.creation.should.not.equal(creation1);
            done();
        });
    });

    /**
     * Draft : draft1
     */
    it("now publish this draft", function(done){
        get("/manage/publish/draft?query=" + query, done, function(res){
            res.body.code.should.equal(0, res.body.data);
            done();
        });
    });

    var release1 = null;

    /**
     * Draft : draft1
     * Version : [draft1]
     * Release : [draft1]
     */
    it("validate the release", function(done){
        method("post", "/manage/release?query=" + query, "", done, function(res){
            res.body.code.should.equal(0, res.body.data);
            release1 = res.body.data;
            releaseValid(release1, versiondata1);
            done();
        });
    });

    var version1 = null;
    /**
     * Draft : draft1
     * Version : [draft1]
     * Release : release1
     */
    it("validate the version", function(done){
        get("/rest/version?query=" + query, done, function(res){
            res.body.code.should.equal(0, res.body.data);
            res.body.data.length.should.equal(1);
            version1 = res.body.data[0];
            release1.v.should.equal(version1._id);
            version1.publish.should.not.equal(0);
            versionValid(version1, draft1);
            version1.creation.should.be.above(draft1.creation);
            version1.publish.should.be.above(draft1.creation);
            done();
        });
    })

    var versiondata2 = versions[1];
    versiondata2.advid = testadvid;

    /**
     * Draft : draft1
     * Version : version1
     * Release : release1
     */
    it("update the draft again", function(done){
        method("put", "/rest/draft?query=" + query, versiondata2, done, function(res){
            res.body.code.should.equal(0);
            done();
        });
    });

    var draft2 = null;

    /**
     * Draft : [versiondata2]
     * Version : version1
     * Release : release1
     */
    it("check the draft again", function(done){
        get("/rest/draft?query=" + query, done, function(res){
            res.body.code.should.equal(0, res.body.data);
            res.body.data.length.should.equal(1);
            draft2 = res.body.data[0];

            draftValid(draft2, versiondata2);
            draft2._id.should.equal(draft1._id);
            draft2.creation.should.be.above(draft1.creation);
            done();
        });
    });

    /**
     * Draft : draft2
     * Version : version1
     * Release : release1
     */
    it("save the draft to version", function(done){
        get("/manage/toversion?query=" + query, done, function(res){
            res.body.code.should.equal(0, res.body.data);
            done();
        });
    });

    var version2 = null;
    /**
     * Draft : draft2
     * Version : <version1, [draft2]>
     * Release : release1
     */
    it("check the versions", function(done){
        get("/rest/version?query=" + query, done, function(res){
            res.body.code.should.equal(0, res.body.data);
            res.body.data.length.should.equal(2);
            res.body.data[0].name.should.equal(version1.name);
            version2 = res.body.data[1];
            version2.publish.should.equal(0);
            version2._id.should.not.equal(draft2._id);
            versionValid(version2, draft2);
            version2.creation.should.be.above(draft2.creation);
            done();
        });
    });

    /**
     * Draft : draft2
     * Version : <version1, version2>
     * Release : release1
     */
    it("publish this version", function(done){
        get("/manage/publish/version/" + version2._id + "?query=" + query, done, function(res){
            res.body.code.should.equal(0, res.body.data);
            done();
        });
    });

    var release2;
    /**
     * Draft : draft2,
     * version : <version1, version2>
     * release : [version2]
     */
    it("check the release", function(done){
        method("post", "/manage/release?query=" + query, "", done, function(res){
            res.body.code.should.equal(0, res.body.data);
            release2 = res.body.data;
            releaseValid(release2, versiondata2);
            done();
        });
    });

    /**
     * Draft : draft2
     * Version : <version1, version2>
     * Release : release2
     */
    it("check the versions", function(done){
        get("/rest/version/" + version2._id + "?query=" + query, done, function(res){
            res.body.code.should.equal(0, res.body.data);
            version2 = res.body.data;
            release2.v.should.equal(version2._id);
            version2.publish.should.be.above(version1.publish);
            versionValid(version2, draft2);
            version2.creation.should.be.above(draft2.creation);
            done();
        });
    });

    /**
     * Draft : draft2
     * Version : <version1, version2>
     * Release : release2
     */
    it("export version1 to draft overwrite", function(done){
        get("/manage/export?query=" + query + "&from=" + version1._id + "&overwrite=true", done, function(res){
            res.body.code.should.equal(0);
            done();
        });
    });

    /**
     * draft : draft2
     * version : version1, version2
     * release : release2
     */
    it("check the versions", function(done){
        get("/rest/version?query=" + query, done, function(res){
            res.body.code.should.equal(0, res.body.data);
            res.body.data.length.should.equal(2);
            done();
        });
    });

    /**
     * Draft : [version1]
     * Version : version1, version2
     * Release : release2
     */
    it("check the draft", function(done){
        get("/rest/draft?query=" + query, done, function(res){
            res.body.code.should.equal(0, res.body.data);
            res.body.data.length.should.equal(1);
            var newDraft = res.body.data[0];
            draftValid(newDraft, version1);
            newDraft._id.should.equal(draft2._id);
            newDraft.creation.should.be.above(draft2.creation);
            draft1 = newDraft;
            done();
        });
    });


    /**
     * Draft : draft1
     * Version : version1, version2
     * Release : release2
     */
    it("export version2 to draft without overwrite", function(done){
        get("/manage/export?query=" + query + "&from=" + version2._id + "&overwrite=false", done, function(res){
            res.body.code.should.equal(0);
            done();
        });
    });

    /**
     * Draft : [version2]
     * Version : version1, version2, [draft1]
     * Release : release2
     */
    it("check the draft", function(done){
        get("/rest/draft?query=" + query, done, function(res){
            res.body.code.should.equal(0, res.body.data);
            res.body.data.length.should.equal(1);
            var newDraft = res.body.data[0];

            draftValid(newDraft, version2);
            newDraft._id.should.equal(draft1._id);
            newDraft.creation.should.be.above(draft1.creation);
            draft2 = newDraft;
            done();
        });
    });

    var version3 = null;
    /**
     * Draft : draft2
     * Version : version1, version2, [draft1]
     * Release : release2
     */
    it("check the versions", function(done){
        get("/rest/version?query=" + query, done, function(res){
            res.body.code.should.equal(0, res.body.data);
            res.body.data.length.should.equal(3);
            version3 = res.body.data[2];
            version3.publish.should.be.equal(0);
            versionValid(version3, version1);
            version3.creation.should.be.above(version1.creation);
            done();
        });
    });

    /**
     * Draft : draft2
     * Version : version1, version2, version3
     * Release : release2
     */
    it("check all the configurations", function(done){
        get("/manage?query=" + query, done, function(res){
            res.body.code.should.equal(0, res.body.data);
            res.body.data.length.should.equal(4);

            for(var i = 0; i < 3; i++){
                var data = res.body.data[i];
                versionValid(data, [version1, version2, version3][i]);
            }

            var draft = res.body.data[3];
            draft.draft.should.be.true;
            delete draft.draft;
            draftValid(draft, draft2);
            done();
        });
    });

    /**
     * Draft : draft2
     * Version : version1, version2, version3
     * Release : release2
     */
    it("debug version1", function(done){
        get("/manage/release?query=" + query, done, function(res){
            res.body.code.should.equal(0, res.body.data);
            releaseValid(res.body.data, version2);
            res.body.data.v.should.equal(version2._id);
            done();
            get("/manage/debug/version/" + version1._id + "?query=" + query, done, function(res){
                res.body.code.should.equal(0, res.body.data);

                var cookies = res.headers['set-cookie'];

                cookies.forEach(function(cookie){
                    if(cookie.substr(0, cookieHead.length) == cookieHead){
                        var end = cookie.indexOf(";");
                        var text = queryString.unescape(cookie.substr(cookieHead.length + 1 , end - cookieHead.length - 1));
                        var textJson = JSON.parse(text);
                        textJson[testadvid].should.equal(version1._id);
                        done();
                    }
                });
            });
        });

    });

    it("check the debug version1 works", function(done){
        var fackeCookie = {};
        fackeCookie[testadvid] = version1._id;
        var cookie = JSON.stringify(fackeCookie);
        get("/manage/release?query=" + query + "&pycodeconf=" + cookie, done, function(res){
            res.body.code.should.equal(0, res.body.data);
            releaseValid(res.body.data, version1, 2);
            res.body.data.v.should.equal(version1._id);
            done();
        });
    });

    /**
     * Draft : draft2
     * Version : version1, version2, version3
     * Release : release2
     */
    it("debug draft", function(done){
        get("/manage/debug/draft?query=" + query, done, function(res){
            res.body.code.should.equal(0, res.body.data);
            var cookies = res.headers['set-cookie'];

            cookies.forEach(function(cookie){
                if(cookie.substr(0, cookieHead.length) == cookieHead){
                    var end = cookie.indexOf(";");
                    var text = queryString.unescape(cookie.substr(cookieHead.length + 1 , end - cookieHead.length - 1));
                    var textJson = JSON.parse(text);
                    textJson[testadvid].should.equal("");
                    done();
                }
            });
        });
    });

    /**
     * Draft : draft2
     * Version : version1, version2, version3
     * Release : release2
     */
    it("check the debug draft works", function(done){
        var fackeCookie = {};
        fackeCookie[testadvid] = "";
        var cookie = JSON.stringify(fackeCookie);
        get("/manage/release?query=" + query + "&pycodeconf=" + cookie, done, function(res){
            res.body.code.should.equal(0, res.body.data);
            releaseValid(res.body.data, version2, 2);
            res.body.data.v.should.equal(draft2._id);
            done();
        });
    });

    /**
     * Draft : draft2
     * Version : version1, version2, version3
     * Release : release2
     */
    it("undebug advertiser", function(done){
        var cookie = {};
        cookie[testadvid] = "";

        var sendCookie = cookieHead+ "=" + JSON.stringify(cookie);

        getWithCookie("/manage/undebug?query=" + query, sendCookie, done, function(res){
            res.body.code.should.equal(0, res.body.data);
            var cookies = res.headers['set-cookie'];

            cookies.forEach(function(cookie){
                if(cookie.substr(0, cookieHead.length) == cookieHead){
                    var end = cookie.indexOf(";");
                    var array = cookie.split(";");
                    array[0].should.equal(cookieHead+"=");
                    done();
                }
            });
        });
    });
    var testadvid2 = "testadvid2";
});