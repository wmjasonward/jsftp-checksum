/* vim:set ts=2 sw=2 sts=2 expandtab */
/*global require: true module: true */
/*
  *
  *  To test against a live server, set these env vars:
  *
  *  FTP_HOST
  *  FTP_USER
  *  FTP_PASS
  *  FTP_PORT
  *  FTP_TEST_PATHNAME (the pathname to send through to the checksum commands)
  *
  *  If FTP_HOST is not set, these tests will be skipped
  *
  *  These test include some console.log statements to indicate if the server
  *  does not advertise feature support for the checksum command being tested
  *
  *
  *  Note: we are not testing the accuracy of the checksum, just that we get
  *  something that looks like a checksum from the server when supported.
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

const jsftp = require("jsftp");
require("../index.js")(jsftp);

const options = {
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER || "anonymous",
  pass: process.env.FTP_PASS || "anonymous",
  port: process.env.FTP_PORT || 21,
};


/**
 * simple regex based validator to ensure the passed string
 * looks like a valid hex-encoded value
 * we don't actually decode it
 */
function ishexStr(str) {
  return (typeof str === 'string') && str.match(/^[0-9a-f]+$/i);
}

describe(`testing against live server - ${process.env.FTP_HOST}`, function () {
  let ftp;
  let features = [];

  const hasFeat = (feat) => {
    const lfeat = feat.toLowerCase(); // jsftp uses toLowerCase on features
    return features.some(f => f.startsWith(lfeat));
  };

  before(function () {
    if (!process.env.FTP_HOST) {
      this.skip();
    }
  });

  before(function (done) {
    ftp = new jsftp(options);
    ftp.once("connect", done);
  });

  before(function (done) {
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

  // if the server advertises the feature, we expect an error
  // if it does, we expect a digest of the proper size
  it("md5 command", function (done) {
    ftp.md5(process.env.FTP_TEST_PATHNAME, (err, checksum) => {
      if (hasFeat("md5")) {
        assert.ok(!err, `md5 command generated unexpected error: ${JSON.stringify(err)}`);
        assert.ok(ishexStr(checksum) && checksum.length === 32, `returned checksum doesn't appear to be md5 hash: ${checksum}`);
        done();
      } else {
        console.warn("server does not advertise md5 feature support");
        assert.ok(err, `server doesn't advertise md5 feature, but we did not get an error as expected`);
        done();
      }
    });
  });

  it("xmd5 command", function (done) {
    ftp.xmd5(process.env.FTP_TEST_PATHNAME, (err, checksum) => {
      if (hasFeat("xmd5")) {
        assert.ok(!err, `xmd5 command generated unexpected error: ${JSON.stringify(err)}`);
        assert.ok(ishexStr(checksum) && checksum.length === 32, "returned checksum doesn't appear to be md5 hash");
        done();
      } else {
        console.warn("server does not advertise xmd5 feature support");
        assert.ok(err, `server doesn't advertise xmd5 feature, but we did not get an error as expected`);
        done();
      }
    });
  });

  it("xcrc command", function (done) {
    ftp.xcrc(process.env.FTP_TEST_PATHNAME, (err, checksum) => {
      if (hasFeat("xcrc")) {
        assert.ok(!err, "xcrc command generated unexpected error");
        assert.ok(ishexStr(checksum) && checksum.length === 8, "returned checksum doesn't appear to be crc hash");
      done();
      } else {
        console.warn("server does not advertise xcrc feature support");
        assert.ok(err, `server doesn't advertise xcrc feature, but we did not get an error as expected`);
        done();
      }
    });
  });

  it("xsha1 command", function (done) {
    ftp.xsha1(process.env.FTP_TEST_PATHNAME, (err, checksum) => {
      if (hasFeat("xsha1")) {
        assert.ok(!err, "xsha1 command generated unexpected error");
        assert.ok(ishexStr(checksum) && checksum.length === 40, "returned checksum doesn't appear to be xsha1 hash");
        done();
      } else {
        console.warn("server does not advertise xsha1 feature support");
        assert.ok(err, `server doesn't advertise xsha1 feature, but we did not get an error as expected`);
        done();
      }
    });
  });

  it("xsha256 command", function (done) {
    ftp.xsha256(process.env.FTP_TEST_PATHNAME, (err, checksum) => {
      if (hasFeat("xsha256")) {
        assert.ok(!err, "xsha256 command generated unexpected error");
        assert.ok(ishexStr(checksum) && checksum.length === 64, "returned checksum doesn't appear to be xsha256 hash");
        done();
      } else {
        console.warn("server does not advertise xsha256 feature support");
        assert.ok(err, `server doesn't advertise xsha256 feature, but we did not get an error as expected`);
        done();
      }
    });
  });

  it("xsha512 command", function (done) {
    ftp.xsha512(process.env.FTP_TEST_PATHNAME, (err, checksum) => {
      if (hasFeat("xsha512")) {
        assert.ok(!err, "xsha512 command generated unexpected error");
        assert.ok(ishexStr(checksum) && checksum.length === 128, "returned checksum doesn't appear to be xsha512 hash");
        done();
      } else {
        console.warn("server does not advertise xsha256 feature support");
        assert.ok(err, `server doesn't advertise xsha256 feature, but we did not get an error as expected`);
        done();
      }
    });
  });

});
