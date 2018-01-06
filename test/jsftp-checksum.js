/* vim:set ts=2 sw=2 sts=2 expandtab */
/*global require: true module: true */
/*
  *
  *  To test against a live server, set these env vars:
  *  FTP_HOST
  *  FTP_USER
  *  FTP_PASS
  *  FTP_PORT
  *  FTP_TEST_PATHNAME (the pathname to send through to the checksum commands)
  *
  * @package jsftp-checksum
  * @copyright Copyright(c) 2017 Jason Ward
  * @author Jason Ward <wmjasonward@gmail.com>
  * @license https://github.com/wmjasonward/jsftp-checksum/blob/master/LICENSE
*/

"use strict";

// use assert like upstream jsftp
const assert = require("assert");
const sinon = require("sinon");
const ftpserver = require("./helpers/server.js");


const jsftp = require("jsftp");
require("../index.js")(jsftp);

const options = {
  host: process.env.FTP_HOST || "127.0.0.1",
  user: process.env.FTP_USER || "user",
  pass: process.env.FTP_PASS || "12345",
  port: process.env.FTP_PORT || (process.env.FTP_HOST ? 21 :  7002),
};

describe("Parse expected responses", function() {
  var _server;
  var ftp;
  var sandbox;

  before(function(done) {
    if (process.env.FTP_HOST) {
      done();
    } else {
      _server = ftpserver.makeServer(options);
      _server.listen(options.port);
      setTimeout(done, 100);
    }
  });

  before(function(done) {
    ftp = new jsftp(options);
    ftp.once("connect", done);
  });

  after(done => {
    if (ftp) {
      ftp.destroy();
      ftp = null;
    }

    if (_server) {
      _server.close(done);
    } else {
      done();
    }
  });

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
    sandbox = null;
  });

  describe("md5 checksum command", function() {
    it("parses md5 command response (proftpd w/mod-digest)", function(done) {
      sandbox.stub(ftp, "raw").callsArgWith(1, null, {
        code: 251,
        text: "251-Computing MD5 digest\n251 myfile.txt 7F1EE68D2344001A050752B669242182",
        isError: false,
      });

      ftp.md5("myfile.txt", function(err, checksum) {
        assert.ok(!err, "md5 generated error");
        assert.ok(checksum && checksum === "7F1EE68D2344001A050752B669242182", "checksum not expected value");
        done();
      });
    });

    it("reports error if server md5 response cannot be parsed", function(done) {
      // just send something through that breaks the regex
      sandbox.stub(ftp, "raw").callsArgWith(1, null, {
        code: 251,
        text: "251-Parse this\n251 If you dare",
        isError: false,
      });

      ftp.md5("myfile.txt", function(err, checksum) {
        assert.ok(err && err.text === "Unable to parse MD5 response", "should not have returned checksum here");
        done();
      });
    });

    it("reports error if md5 feature not available", function(done) {
      // the ftpd test server does not support any checksums so send it through
      ftp.md5("myfile.txt", function(err, checksum) {
        assert.ok(err && err.code >= 500, "expected error with >= 500 code");
        done();
      });
    });

  });

  describe("xmd5 checksum command", function() {
    it("parses xmd5 command response (proftpd w/mod-digest)", function(done) {
      sandbox.stub(ftp, "raw").callsArgWith(1, null, {
        code: 250,
        text: "250-Computing MD5 digest\n250 7F1EE68D2344001A050752B669242182",
        isError: false,
      });

      ftp.xmd5("myfile.txt", function(err, checksum) {
        assert.ok(!err, "xmd5 generated error");
        assert.ok(checksum && checksum === "7F1EE68D2344001A050752B669242182", "checksum not expected value");
        done();
      });
    });

    it("parses xmd5 command response (jscape-mft)", function(done) {
      sandbox.stub(ftp, "raw").callsArgWith(1, null, {
        code: 250,
        text: "250 234e85323403262a4c696c8257c565b2",
        isError: false,
      });

      ftp.xmd5("myfile.txt", function(err, checksum) {
        assert.ok(!err, "xmd5 generated error");
        assert.ok(checksum && checksum === "234E85323403262A4C696C8257C565B2", "checksum not expected value");
        done();
      });
    });

    it("reports error if server xmd5 response cannot be parsed", function(done) {
      // just send something through that breaks the regex
      sandbox.stub(ftp, "raw").callsArgWith(1, null, {
        code: 251,
        text: "251-Parse this\n251 If you dare",
        isError: false,
      });

      ftp.xmd5("myfile.txt", function(err, checksum) {
        assert.ok(err && err.text === "Unable to parse XMD5 response", "should not have returned checksum here");
        done();
      });
    });

    it("reports error if xmd5 feature not available", function(done) {
      // the ftpd test server does not support any checksums so send it through
      ftp.xmd5("myfile.txt", function(err, checksum) {
        assert.ok(err && err.code >= 500, "expected error with >= 500 code");
        done();
      });
    });

  });

  describe("xcrc checksum command", function() {
    it("parses xcrc command response (proftpd w/mod-digest)", function(done) {
      sandbox.stub(ftp, "raw").callsArgWith(1, null, {
        code: 250,
        text: "250-Computing CRC32 digest\n250 B0A3981C",
        isError: false,
      });

      ftp.xcrc("myfile.txt", function(err, checksum) {
        assert.ok(!err, "xcrc generated error");
        assert.ok(checksum && checksum === "B0A3981C", "checksum not expected value");
        done();
      });
    });

    it("parses xcrc command response (jscape-mft)", function(done) {
      sandbox.stub(ftp, "raw").callsArgWith(1, null, {
        code: 250,
        text: "250 4c1ee712",
        isError: false,
      });

      ftp.xcrc("myfile.txt", function(err, checksum) {
        assert.ok(!err, "xcrc generated error");
        assert.ok(checksum && checksum === "4C1EE712", "checksum not expected value");
        done();
      });
    });

    it("reports error if server xcrc response cannot be parsed", function(done) {
      // just send something through that breaks the regex
      sandbox.stub(ftp, "raw").callsArgWith(1, null, {
        code: 251,
        text: "251-Parse this\n251 If you dare",
        isError: false,
      });

      ftp.xcrc("myfile.txt", function(err, checksum) {
        assert.ok(err && err.text === "Unable to parse XCRC response", "should not have returned checksum here");
        done();
      });
    });

    it("reports error if xcrc feature not available", function(done) {
      // the ftpd test server does not support any checksums so send it through
      ftp.xcrc("myfile.txt", function(err, checksum) {
        assert.ok(err && err.code >= 500, "expected error with >= 500 code");
        done();
      });
    });

  });

  describe("xsha1 checksum command", function() {
    it("parses xsha1 command response (proftpd w/mod-digest)", function(done) {
      sandbox.stub(ftp, "raw").callsArgWith(1, null, {
        code: 250,
        text: "250-Computing SHA1 digest\n250 85C7C35F151659B612C67ED74C4760A78D89F4C8",
        isError: false,
      });

      ftp.xsha1("myfile.txt", function(err, checksum) {
        assert.ok(!err, "xsha1 generated error");
        assert.ok(checksum && checksum === "85C7C35F151659B612C67ED74C4760A78D89F4C8", "checksum not expected value");
        done();
      });
    });

    it("reports error if server xsha1 response cannot be parsed", function(done) {
      // just send something through that breaks the regex
      sandbox.stub(ftp, "raw").callsArgWith(1, null, {
        code: 251,
        text: "251-Parse this\n251 If you dare",
        isError: false,
      });

      ftp.xsha1("myfile.txt", function(err, checksum) {
        assert.ok(err && err.text === "Unable to parse XSHA1 response", "should not have returned checksum here");
        done();
      });
    });

    it("reports error if xsha1 feature not available", function(done) {
      // the ftpd test server does not support any checksums so send it through
      ftp.xsha1("myfile.txt", function(err, checksum) {
        assert.ok(err && err.code >= 500, "expected error with >= 500 code");
        done();
      });
    });

  });

  describe("xsha256 checksum command", function() {
    it("parses xsha256 command response (proftpd w/mod-digest)", function(done) {
      sandbox.stub(ftp, "raw").callsArgWith(1, null, {
        code: 250,
        text: "250-Computing SHA256 digest\n250 06FB0EF81B1DC52CB18E1884211F18E1E2423A5B7B00978BD4DF4D97DCB9FF3C",
        isError: false,
      });

      ftp.xsha256("myfile.txt", function(err, checksum) {
        assert.ok(!err, "xsha256 generated error");
        assert.ok(checksum && checksum === "06FB0EF81B1DC52CB18E1884211F18E1E2423A5B7B00978BD4DF4D97DCB9FF3C", "checksum not expected value");
        done();
      });
    });

    it("reports error if server xsha256 response cannot be parsed", function(done) {
      // just send something through that breaks the regex
      sandbox.stub(ftp, "raw").callsArgWith(1, null, {
        code: 251,
        text: "251-Parse this\n251 If you dare",
        isError: false,
      });

      ftp.xsha256("myfile.txt", function(err, checksum) {
        assert.ok(err && err.text === "Unable to parse XSHA256 response", "should not have returned checksum here");
        done();
      });
    });

    it("reports error if xsha256 feature not available", function(done) {
      // the ftpd test server does not support any checksums so send it through
      ftp.xsha256("myfile.txt", function(err, checksum) {
        assert.ok(err && err.code >= 500, "expected error with >= 500 code");
        done();
      });
    });

  });

  describe("xsha512 checksum command", function() {
    it("parses xsha512 command response (proftpd w/mod-digest)", function(done) {
      sandbox.stub(ftp, "raw").callsArgWith(1, null, {
        code: 250,
        text: "250-Computing SHA512 digest\n250 44C4541AB7A3E73F29BAEBE5EE80B522D67204EA7BABEB7E7DC243FF87A363FC2F352A9AFC8ECAAB8F364DBDFB58B42E22AAC744CD8226A61FE01C801EAC385B",
        isError: false,
      });

      ftp.xsha512("myfile.txt", function(err, checksum) {
        assert.ok(!err, "xsha512 generated error");
        assert.ok(checksum && checksum === "44C4541AB7A3E73F29BAEBE5EE80B522D67204EA7BABEB7E7DC243FF87A363FC2F352A9AFC8ECAAB8F364DBDFB58B42E22AAC744CD8226A61FE01C801EAC385B", "checksum not expected value");
        done();
      });
    });

    it("reports error if server xsha512 response cannot be parsed", function(done) {
      // just send something through that breaks the regex
      sandbox.stub(ftp, "raw").callsArgWith(1, null, {
        code: 251,
        text: "251-Parse this\n251 If you dare",
        isError: false,
      });

      ftp.xsha512("myfile.txt", function(err, checksum) {
        assert.ok(err && err.text === "Unable to parse XSHA512 response", "should not have returned checksum here");
        done();
      });
    });

    it("reports error if xsha512 feature not available", function(done) {
      // the ftpd test server does not support any checksums so send it through
      ftp.xsha512("myfile.txt", function(err, checksum) {
        assert.ok(err && err.code >= 500, "expected error with >= 500 code");
        done();
      });
    });

  });

});

/**
 * simple regex based validator to ensure the passed string
 * looks like a valid hex-encoded value
 * we don't actually decode it
 */
function ishexStr(str) {
  return (typeof str === 'string') && str.match(/^[0-9a-f]+$/i);
}

describe("tests against live server", function() {
  let ftp;
  let features = [];

  // const hasFeat = (feat) => {
  //   const lfeat = feat.toLowerCase(); // jsftp uses toLowerCase on features
  //   return features.some(f => f.startsWith(lfeat));
  // };

  before(function() {
    if (!process.env.FTP_HOST) {
      this.skip();
    }
  });

  before(function(done) {
    ftp = new jsftp(options);
    ftp.once("connect", done);
  });

  before(function(done) {
    ftp.getFeatures((err, feats) => {
      // todo: if err - bail
      features = feats;
      done();
    });
  });

  after(() => {
    if (ftp) {
      ftp.destroy();
      ftp = null;
    }
  });

  // todo: modify these so that what we're testing depends on what the server advertises in feat
  // if it doesn't advertise a command, we expect an error
  // if it does, we expect a digest of the proper size
  // server has the feature, we'll expect a valid result
  it("md5 command", function(done) {
    ftp.md5(process.env.FTP_TEST_PATHNAME, (err, checksum) => {
      assert.ok(!err, "md5 command generated unexpected error");
      assert.ok(ishexStr(checksum) && checksum.length === 32, "returned checksum doesn't appear to be md5 hash");
      done();
    });
  });

  it("xmd5 command", function(done) {
    ftp.xmd5(process.env.FTP_TEST_PATHNAME, (err, checksum) => {
      assert.ok(!err, "xmd5 command generated unexpected error");
      assert.ok(ishexStr(checksum) && checksum.length === 32, "returned checksum doesn't appear to be md5 hash");
      done();
    });
  });

  it("xcrc command", function(done) {
    ftp.xcrc(process.env.FTP_TEST_PATHNAME, (err, checksum) => {
      assert.ok(!err, "xcrc command generated unexpected error");
      assert.ok(ishexStr(checksum) && checksum.length === 8, "returned checksum doesn't appear to be crc hash");
      done();
    });
  });

  it("xsha1 command", function(done) {
    ftp.xsha1(process.env.FTP_TEST_PATHNAME, (err, checksum) => {
      assert.ok(!err, "xsha1 command generated unexpected error");
      assert.ok(ishexStr(checksum) && checksum.length === 40, "returned checksum doesn't appear to be xsha1 hash");
      done();
    });
  });

  it("xsha256 command", function(done) {
    ftp.xsha256(process.env.FTP_TEST_PATHNAME, (err, checksum) => {
      assert.ok(!err, "xsha256 command generated unexpected error");
      assert.ok(ishexStr(checksum) && checksum.length === 64, "returned checksum doesn't appear to be xsha256 hash");
      done();
    });
  });

  it("xsha512 command", function(done) {
    ftp.xsha512(process.env.FTP_TEST_PATHNAME, (err, checksum) => {
      assert.ok(!err, "xsha512 command generated unexpected error");
      assert.ok(ishexStr(checksum) && checksum.length === 128, "returned checksum doesn't appear to be xsha512 hash");
      done();
    });
  });

});
