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
   * rawChecksumCommandHelper
   * uses 'this' - be sure to set context to jsftp
   *
   * @param {string} cmd The checksum algorithm command (MD5, XMD5, etc)
   * @param {string} pathname The pathname to retrieve the checksum for
   * @param {function} parser A function that extracts the checksum from the server response
   * @param {function} callback
   */
  function rawChecksumCommandHelper(cmd, pathname, parser, callback) {

    this.raw(`${cmd} ${pathname}`, function(err, response) {
      if (err) {
        callback(err);
      } else {
        const checksum = parser(response);
        if (checksum) {
          callback(null, checksum.toLocaleUpperCase());
        } else {
          callback({
            code: 500,
            text: `Unable to parse ${cmd} response`,
            response: response,
            isError: true,
          }, null);
        }
      }
    });
  }

  /**
   * returns a function that tests the last line of the response
   * to the regex, returning the passed group number if match
   * null if no match
   *
   * @param {regex} regex The regular expression to match against the server command response
   * @group {number} group The group index of the match results that contain the checksum
   * @return {string} The checksum as extracted by regex, or null if no match
   */
  const regexParser = (regex, group) => {
    return response => {
      const lines = response.text.split("\n");
      if (lines.length > 0) {
        const groups = (lines.slice(-1)[0]).match(regex);
        if (groups) {
          return groups[group]; // eslint-disable-line security/detect-object-injection
        }
      }
      return null;
    };
  };

  // parser func used by md5 and xmd5
  const md5Parser = regexParser(/^2\d\d .*\b([a-f0-9]{32})\b.*$/i, 1);

  /**
   * Calls the server's MD5 command and parses the result
   * It's up to the client to ensure that the server provides this feature
   *
   * @param {string} pathname
   * @param {function} callback if successful, called with md5 hash from server
   */
  jsftp.prototype.md5 = function(pathname, callback) {
    rawChecksumCommandHelper.call(this, "MD5", pathname, md5Parser, callback);
  };

  /**
   * Calls the server's XMD5 command and parses the result
   * It's up to the client to ensure that the server provides this feature
   *
   *
   * @param {string} pathname
   * @param {function} callback if successful, called with md5 hash from server
   */
  jsftp.prototype.xmd5 = function(pathname, callback) {
    rawChecksumCommandHelper.call(this, "XMD5", pathname, md5Parser, callback);
  };

  // parser func used by xcrc
  const xcrcParser = regexParser(/^2\d\d .*\b([a-f0-9]{8})\b.*$/i, 1);

  /**
   * Calls the server's XCRC command and parses the result
   * It's up to the client to ensure that the server provides this feature
   *
   * @param {string} pathname
   * @param {function} callback if successful, called with crc hash from server
   */
  jsftp.prototype.xcrc = function(pathname, callback) {
    rawChecksumCommandHelper.call(this, "XCRC", pathname, xcrcParser, callback);
  };

  // parser func used by xsha1
  const xsha1Parser = regexParser(/^2\d\d .*\b([a-f0-9]{40})\b.*$/i, 1);

  /**
   * Calls the server's XSHA command and parses the result
   * It's up to the client to ensure that the server provides this feature
   *
   * @param {string} pathname
   * @param {function} callback if successful, called with sha1 hash from server
   */
  jsftp.prototype.xsha = function(pathname, callback) {
    rawChecksumCommandHelper.call(this, "XSHA", pathname, xsha1Parser, callback);
  };

  /**
   * Calls the server's XSHA1 command and parses the result
   * It's up to the client to ensure that the server provides this feature
   *
   * @param {string} pathname
   * @param {function} callback if successful, called with sha1 hash from server
   */
  jsftp.prototype.xsha1 = function(pathname, callback) {
    rawChecksumCommandHelper.call(this, "XSHA1", pathname, xsha1Parser, callback);
  };

  // parser func used by xsha256
  const xsha256Parser = regexParser(/^2\d\d .*\b([a-f0-9]{64})\b.*$/i, 1);
  /**
   * Calls the server's XSHA256 command and parses the result
   * It's up to the client to ensure that the server provides this feature
   *
   * @param {string} pathname
   * @param {function} callback if successful, called with sha256 hash
   */
  jsftp.prototype.xsha256 = function(pathname, callback) {
    rawChecksumCommandHelper.call(this, "XSHA256", pathname, xsha256Parser, callback);
  };

  // parser func used by xsha512
  const xsha512Parser = regexParser(/^2\d\d .*\b([a-f0-9]{128})\b.*$/i, 1);
  /**
   * Calls the server's XSHA512 command and parses the result
   * It's up to the client to ensure that the server provides this feature
   *
   * @param {string} pathname
   * @param {function} callback if successful, called with sha512 hash from server
   */
  jsftp.prototype.xsha512 = function(pathname, callback) {
    rawChecksumCommandHelper.call(this, "XSHA512", pathname, xsha512Parser, callback);
  };

  return jsftp;
};
