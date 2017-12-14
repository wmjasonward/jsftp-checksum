# jsftp-checksum
Decorate JSFtp with some checksum support

See:

[JSFtp Homepage](https://github.com/sergi/jsftp "JSFtp Homepage")

[List of Non-standard Cryptographic Hash...](https://tools.ietf.org/id/draft-bryan-ftp-hash-03.html#rfc.appendix.Appendix%20B)

Be sure to check that the Ftp server supports the desired
checksum algorithm before trying to use it.

The checksums supported here are non-standard so YMMV. Feel free to report an issue
if one of the included checksum algorithms doesn't work as expected with your ftp
server. If you do, please include the full server response.

All checksums are converted to upper case. So far, encountered
checksums from the server are hex-encoded strings.

#### Starting it up

```javascript
var JSFtp = require("jsftp");
require('jsftp-checksum')(JSFtp);

var Ftp = new JSFtp({
  host: "myserver.com",
  port: 3331, // defaults to 21
  user: "user", // defaults to "anonymous"
  pass: "1234" // defaults to "@anonymous"
});
```

#### Added Methods

##### Ftp.md5(pathname, callback)

With the `md5` method you can retrieve the MD5 checksum for a file on the server
that accepts the MD5 command. The method accepts a callback with the signature `err, checksum`, in which `err` is the error
response coming from the server (usually a 4xx or 5xx error code), or an error
indicating the MD5 response couldn't be parsed, and `checksum`
is a string containing the checksum.

Known server support seems to be based on:
[FTP MD5 Draft Spec - Expired](https://tools.ietf.org/html/draft-twine-ftpmd5-00 "Expired FTP MD5 Draft Spec") 

```javascript

Ftp.md5('myfile.txt', (err, checksum) => {
  if (err) {
    console.log(err);
  } else {
    console.log(checksum);
    // Prints something like
    // 7F1EE68D2344001A050752B669242182
  }
});
```
##### Ftp.xmd5(pathname, callback)

With the `xmd5` method you can retrieve the MD5 checksum for a file on the server
that accepts the XMD5 command. The method accepts a callback with the signature `err, checksum`, in which `err` is the error
response coming from the server (usually a 4xx or 5xx error code), or an error
indicating the XMD5 response couldn't be parsed, and `checksum`
is a string containing the checksum.

```javascript

Ftp.xmd5('myfile.txt', (err, checksum) => {
  if (err) {
    console.log(err);
  } else {
    console.log(checksum);
    // Prints something like
    // 7F1EE68D2344001A050752B669242182
  }
});
```

##### Ftp.xcrc(pathname, callback)

With the `xcrc` method you can retrieve the CRC checksum for a file on the server
that accepts the XCRC command. The method accepts a callback with the signature `err, checksum`, in which `err` is the error
response coming from the server (usually a 4xx or 5xx error code), or an error
indicating the XCRC response couldn't be parsed, and `checksum`
is a string containing the checksum.

```javascript

Ftp.xcrc('myfile.txt', (err, checksum) => {
  if (err) {
    console.log(err);
  } else {
    console.log(checksum);
    // Prints something like
    // B0A3981C
  }
});
```

##### Ftp.xsha1(pathname, callback)

With the `xsha1` method you can retrieve the SHA1 checksum for a file on the server
that accepts the XSHA1 command. The method accepts a callback with the signature `err, checksum`, in which `err` is the error
response coming from the server (usually a 4xx or 5xx error code), or an error
indicating the XSHA1 response couldn't be parsed, and `checksum`
is a string containing the checksum.

```javascript

Ftp.xsha1('myfile.txt', (err, checksum) => {
  if (err) {
    console.log(err);
  } else {
    console.log(checksum);
    // Prints something like
    // 85C7C35F151659B612C67ED74C4760A78D89F4C8
  }
});
```

##### Ftp.xsha256(pathname, callback)

With the `xsha256` method you can retrieve the SHA256 checksum for a file on the server
that accepts the XSHA256 command. The method accepts a callback with the signature `err, checksum`, in which `err` is the error
response coming from the server (usually a 4xx or 5xx error code), or an error
indicating the XSHA256 response couldn't be parsed, and `checksum`
is a string containing the checksum.

```javascript

Ftp.xsha256('myfile.txt', (err, checksum) => {
  if (err) {
    console.log(err);
  } else {
    console.log(checksum);
    // Prints something like
    // 06FB0EF81B1DC52CB18E1884211F18E1E2423A5B7B00978BD4DF4D97DCB9FF3C
  }
});
```

##### Ftp.xsha512(pathname, callback)

With the `xsha512` method you can retrieve the SHA512 checksum for a file on the server
that accepts the XSHA512 command. The method accepts a callback with the signature `err, checksum`, in which `err` is the error
response coming from the server (usually a 4xx or 5xx error code), or an error
indicating the XSHA512 response couldn't be parsed, and `checksum`
is a string containing the checksum.

```javascript

Ftp.xsha512('myfile.txt', (err, checksum) => {
  if (err) {
    console.log(err);
  } else {
    console.log(checksum);
    // Prints something like
    // 44C4541AB7A3E73F29BAEBE5EE80B522D67204EA7BABEB7E7DC243FF87A363FC2F352A9AFC8ECAAB8F364DBDFB58B42E22AAC744CD8226A61FE01C801EAC385B
  }
});
```


##### Other Notes



I tried to stick to the language support and eslint config of the
jsftp project for consistency.

##### To-Do

Add tests :) My current tests (not included in the repo) rely
on a couple of remote ftp servers I control that support MD5/XCRC/XMD5/XSHA1/XSHA256/XSHA512. I need to
create mock support for included checksums to test against.

Figure out why Ftp.hasFeat doesn't seem to work. Not sure if there's
an upstream problem or I'm just using it wrong. Ideally, you could
call Ftp.hasFeat('XMD5') to ensure the server supports the feature.
As an alternative, create a `hasXMD5` method that does a `Ftp.raw('feat'...)`
and looks for XMD5 in the response (for example).

Create a table of ftp servers, supported hash algorithms,
 and successful tests with this module.
