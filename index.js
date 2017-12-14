/* vim:set ts=2 sw=2 sts=2 expandtab */
/*global require: true module: true */
/*
 * @package jsftp-checksum
 * @copyright Copyright(c) 2017 Jason Ward
 * @author Jason Ward <wmjasonward@gmail.com>
 * @license https://github.com/wmjasonward/jsftp-checksum/blob/master/LICENSE
 */

"use strict";

module.exports = function(jsftp) {

  /**
   * Regular expressions used for pulling the hash out of the response
   * servers are pretty varied in how they implement these so ymmv
   *
   * checksum function expects group 1 of the regular expression to be the hash
   */
  var checksum_algos = {
    "MD5" : /^2\d\d .*\b([a-f0-9]{32})\b.*$/i,
    "XMD5" : /^2\d\d .*\b([a-f0-9]{32})\b.*$/i,
    "XCRC" : /^2\d\d .*\b([a-f0-9]{8})\b.*$/i,
    "XSHA1" : /^2\d\d .*\b([a-f0-9]{40})\b.*$/i,
    "XSHA256" : /^2\d\d .*\b([a-f0-9]{64})\b.*$/i,
    "XSHA512" : /^2\d\d .*\b([a-f0-9]{128})\b.*$/i,
  };

  // attach to prototype - could make private but would need to .apply(this...), or pass in jsftp instance
  jsftp.prototype.checksum = function(pathname, algocmd, callback) {
    if (!checksum_algos[algocmd]) {
      callback({
        Error: `${algocmd} not supported`,
        isError: true,
      });
    }

    this.raw(`${algocmd} ${pathname}`, function(err, response) {
      if (err) {
        callback(err);
      } else {
        var line = response.text.split("\n").pop();
        var parts = line.match(checksum_algos[algocmd]);
        if (parts) {
          callback(null, parts[1].toLocaleUpperCase());
        } else {
          callback({
            code: response.code,
            text: "Unable to parse " + algocmd + " response",
            response: response.text,
            isError: true,
            isMark: response.isMark,
          }, null);
        }
      }
    });
  };

  /**
   * Calls the server's MD5 command and parses the result
   * It"s up to the client to ensure that the server provides this feature
   *
   * ftp.hasFeat("MD5") === true
   *
   * @param {string} pathname
   * @param {function} if successful, called with md5 hash from server
   */
  jsftp.prototype.md5 = function(pathname, callback) {
    this.checksum(pathname, "MD5", callback);
  };

  /**
   * Calls the server's XMD5 command and parses the result
   * It"s up to the client to ensure that the server provides this feature
   *
   * ftp.hasFeat("XMD5") === true
   *
   * @param {string} pathname
   * @param {function} if successful, called with md5 hash from server
   */
  jsftp.prototype.xmd5 = function(pathname, callback) {
    this.checksum(pathname, "XMD5", callback);
  };

  /**
   * Calls the server's XCRC command and parses the result
   * It"s up to the client to ensure that the server provides this feature
   *
   * ftp.hasFeat("XCRC") === true
   *
   * @param {string} pathname
   * @param {function} if successful, called with crc hash from server
   */
  jsftp.prototype.xcrc = function(pathname, callback) {
    this.checksum(pathname, "XCRC", callback);
  };

  /**
   * Calls the server's XSHA1 command and parses the result
   * It"s up to the client to ensure that the server provides this feature
   *
   * ftp.hasFeat("XSHA1") === true
   *
   * @param {string} pathname
   * @param {function} if successful, called with sha1 hash from server
   */
  jsftp.prototype.xsha1= function(pathname, callback) {
    this.checksum(pathname, "XSHA1", callback);
  };

  /**
   * Calls the server's XSHA256 command and parses the result
   * It"s up to the client to ensure that the server provides this feature
   *
   * ftp.hasFeat("XSHA256") === true
   *
   * @param {string} pathname
   * @param {function} callback if successful, called with sha256 hash
   */
  jsftp.prototype.xsha256= function(pathname, callback) {
    this.checksum(pathname, "XSHA256", callback);
  };

  /**
   * Calls the server's XSHA512 command and parses the result
   * It"s up to the client to ensure that the server provides this feature
   *
   * ftp.hasFeat("XSHA512") === true
   *
   * @param {string} pathname
   * @param {function} if successful, called with sha512 hash from server
   */
  jsftp.prototype.xsha512= function(pathname, callback) {
    this.checksum(pathname, "XSHA512", callback);
  };

  return jsftp;
};
