# jsftp-checksum
Adds support for some ftp server checksum commands to JSFtp


Some FTP servers provide commands that allow the client to directly retrieve a checksum for
a file. This can make operations like sync'ing much faster and more reliable since you don't
need to download the file and compare it to your local copy, or rely solely on things like the file
size and modified time to determine if the file has changed. The size reported by
several ftp server commands can just be approximations, and the modified time can change even
if the contents of the file have not changed.
 
This module adds methods to JSFtp to access some of those checksum commands and parse the
results. Currently supported checksum commands: MD5, XMD5, XCRC, XSHA1, XSHA256, XSHA512.


---


References:

[JSFtp Homepage](https://github.com/sergi/jsftp "JSFtp Homepage")

[List of Non-standard Cryptographic Hash...](https://tools.ietf.org/id/draft-bryan-ftp-hash-03.html#rfc.appendix.Appendix%20B)

Be sure to check that the Ftp server supports the desired
checksum algorithm before trying to use it.

The checksums supported here are non-standard so ymmv. Feel free to report an issue
if one of the included checksum algorithms doesn't work as expected with your ftp
server. Be sure to verify that the server supports that algorithm first.
If you do open an issue, please include the full server response.

All checksums are converted to upper case before being returned as hex-encoded strings.

#### Usage Example with Feature Detection

```javascript
const jsftp = require("jsftp");
require('jsftp-checksum')(jsftp);

var Ftp = new jsftp({
  host: "myserver.com",
  port: 3331, // defaults to 21
  user: "user", // defaults to "anonymous"
  pass: "1234" // defaults to "@anonymous"
});

Ftp.on("connect", () => {
  // we need to explicitly call getFeatures in this example since xmd5
  // would be the first command to be executed after connecting
  Ftp.getFeatures(err => {
    if (err) {
      console.log(err);
    } else {
      if (Ftp.hasFeat("xmd5")) {  // command "xmd5" case doesn't matter here
        Ftp.xmd5("myfile.txt", (err, checksum) => {
          if (err) {
            console.log(err);
          } else {
            console.log(checksum);
            // Prints something like
            // 7F1EE68D2344001A050752B669242182
          }
        });
      }
    }
  });

  // Ftp.destroy() when you're finished
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

##### Ftp.xsha(pathname, callback)

With the `xsha` method you can retrieve the SHA1 checksum for a file on the server
that accepts the XSHA command. The method accepts a callback with the signature `err, checksum`, in which `err` is the error
response coming from the server (usually a 4xx or 5xx error code), or an error
indicating the XSHA response couldn't be parsed, and `checksum`
is a string containing the checksum.

```javascript

Ftp.xsha('myfile.txt', (err, checksum) => {
  if (err) {
    console.log(err);
  } else {
    console.log(checksum);
    // Prints something like
    // 85C7C35F151659B612C67ED74C4760A78D89F4C8
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

#### Known Ftp Server Support*

| Server** | MD5 | XMD5 | XCRC | XSHA | XSHA1 | XSHA256 | XSHA512 |
| :--- | :---: | :---: | :---: | :---: |  :---: | :---: | :---: |
| ProFtp+mod_digest | Y | Y | Y | Y | Y | Y | Y |
| JScape MFT | - | Y | Y | - | - | - | - | - |
| Serv-U FTP | - | Y | Y | - | Y | Y | Y |


| Key |  |
| :---: | :--- |
| Y | jsftp-checksum has been successfully tested against this server |
| N | The tested ftp server advertises algorithm support, but jsftp-checksum cannot parse it correctly |
| - | The tested ftp server (as configured) does not support the algorithm |

\* Other Ftp servers may be supported, please report success/failure

\*\* Ftp server support may vary due to version/configuration differences


##### Other Checksum Commands

There are other checksum commands in the wild (and in [this list](https://tools.ietf.org/id/draft-bryan-ftp-hash-03.html#rfc.appendix.Appendix%20B)).
 If you need support for a different one, please open an issue and I'll see if I can add it.
 Or, add it yourself and submit a pull request :)
