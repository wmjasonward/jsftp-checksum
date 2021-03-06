/* vim:set ts=2 sw=2 sts=2 expandtab */
/*global require: true module: true */
/*
  *  This requires an ftp server for JSFtp to construct properly.
  *  Like JSFtp, we're using ftpd to build a local server, but only
  *  for construction purposes.
  *
  *  If you want to see if this works against a live server, use
  *  the live-server.js tests in a addition to this one.
  *
  *  This test suite mocks the ftp server responses since ftpd doesn't
  *  support any of these commands.
  *
  *  If you don't want to build a local server for these test, set
  *  the following env vars to suit your situation:
  *
  *  FTP_HOST
  *  FTP_USER
  *  FTP_PASS
  *  FTP_PORT
  *
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

describe("Parse known server responses and errors", function() {
  let _server;
  let ftp;
  let sandbox;

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

    it("parses xmd5 command response (jscape-mft,serv-u)", function(done) {
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

    it("parses xcrc command response (jscape-mft,serv-u)", function(done) {
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

  describe("xsha checksum command", function() {
    it("parses xsha command response (proftpd w/mod-digest)", function(done) {
      sandbox.stub(ftp, "raw").callsArgWith(1, null, {
        code: 250,
        text: "250-Computing SHA digest\n250 85C7C35F151659B612C67ED74C4760A78D89F4C8",
        isError: false,
      });

      ftp.xsha("myfile.txt", function(err, checksum) {
        assert.ok(!err, "xsha generated error");
        assert.ok(checksum && checksum === "85C7C35F151659B612C67ED74C4760A78D89F4C8", "checksum not expected value");
        done();
      });
    });

    it("parses xsha command response (serv-u)", function(done) {
      sandbox.stub(ftp, "raw").callsArgWith(1, null, {
        code: 250,
        text: "250 85C7C35F151659B612C67ED74C4760A78D89F4C8",
        isError: false,
      });

      ftp.xsha("myfile.txt", function(err, checksum) {
        assert.ok(!err, "xsha generated error");
        assert.ok(checksum && checksum === "85C7C35F151659B612C67ED74C4760A78D89F4C8", "checksum not expected value");
        done();
      });
    });

    it("reports error if server xsha response cannot be parsed", function(done) {
      // just send something through that breaks the regex
      sandbox.stub(ftp, "raw").callsArgWith(1, null, {
        code: 251,
        text: "251-Parse this\n251 If you dare",
        isError: false,
      });

      ftp.xsha("myfile.txt", function(err, checksum) {
        assert.ok(err && err.text === "Unable to parse XSHA response", "should not have returned checksum here");
        done();
      });
    });

    it("reports error if xsha feature not available", function(done) {
      // the ftpd test server does not support any checksums so send it through
      ftp.xsha("myfile.txt", function(err, checksum) {
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

    it("parses xsha1 command response (serv-u)", function(done) {
      sandbox.stub(ftp, "raw").callsArgWith(1, null, {
        code: 250,
        text: "250 85C7C35F151659B612C67ED74C4760A78D89F4C8",
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

    it("parses xsha256 command response (serv-u)", function(done) {
      sandbox.stub(ftp, "raw").callsArgWith(1, null, {
        code: 250,
        text: "250 06FB0EF81B1DC52CB18E1884211F18E1E2423A5B7B00978BD4DF4D97DCB9FF3C",
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

    it("parses xsha512 command response (serv-u)", function(done) {
      sandbox.stub(ftp, "raw").callsArgWith(1, null, {
        code: 250,
        text: "250 44C4541AB7A3E73F29BAEBE5EE80B522D67204EA7BABEB7E7DC243FF87A363FC2F352A9AFC8ECAAB8F364DBDFB58B42E22AAC744CD8226A61FE01C801EAC385B",
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
