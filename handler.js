'use strict'

// module.exports.hello = (event, context, callback) => {
//     const response = {foo: 'bar'}

//     callback(null, response)
// }

// const Image = require("./todos/helpers/image");

// module.exports.generate = (event, context, callback) => {
//     if (!event || event && !event.body) return callback(null, {
//         "statusCode": 500,
//         "headers": {
//             "Access-Control-Allow-Origin": "*"
//         },
//         "body": "No file input"
//     })
//     else {
//         let i = new Image(Buffer.from(event.body, "base64"))
//         i.generate(context, callback)
//     }
// }

/* 
 * MultiPart_parse decodes a multipart/form-data encoded response into a named-part-map.
 * The response can be a string or raw bytes.
 *
 * Usage for string response:
 *      var map = MultiPart_parse(xhr.responseText, xhr.getResponseHeader('Content-Type'));
 *
 * Usage for raw bytes:
 *      xhr.open(..);     
 *      xhr.responseType = "arraybuffer";
 *      ...
 *      var map = MultiPart_parse(xhr.response, xhr.getResponseHeader('Content-Type'));
 *
 * Copyright@ 2013-2014 Wolfgang Kuehn, released under the MIT license.
 */
function MultiPart_parse(body, contentType) {
  // Examples for content types:
  //      multipart/form-data; boundary="----7dd322351017c"; ...
  //      multipart/form-data; boundary=----7dd322351017c; ...
  var m = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);

  if (!m) {
    throw new Error('Bad content-type header, no multipart boundary');
  }

  let s, fieldName;
  let boundary = m[1] || m[2];

  function Header_parse(header) {
    var headerFields = {};
    var matchResult = header.match(/^.*name="([^"]*)"$/);
    if (matchResult) headerFields.name = matchResult[1];
    return headerFields;
  }

  function rawStringToBuffer(str) {
    var idx, len = str.length,
      arr = new Array(len);
    for (idx = 0; idx < len; ++idx) {
      arr[idx] = str.charCodeAt(idx) & 0xFF;
    }
    return new Uint8Array(arr).buffer;
  }

  // \r\n is part of the boundary.
  boundary = '\r\n--' + boundary;

  var isRaw = typeof(body) !== 'string';

  if (isRaw) {
    var view = new Uint8Array(body);
    s = String.fromCharCode.apply(null, view);
  } else {
    s = body;
  }

  // Prepend what has been stripped by the body parsing mechanism.
  s = '\r\n' + s;

  var parts = s.split(new RegExp(boundary)),
    partsByName = {};

  // First part is a preamble, last part is closing '--'
  for (var i = 1; i < parts.length - 1; i++) {
    var subparts = parts[i].split('\r\n\r\n');
    var headers = subparts[0].split('\r\n');
    for (var j = 1; j < headers.length; j++) {
      var headerFields = Header_parse(headers[j]);
      if (headerFields.name) {
        fieldName = headerFields.name;
      }
    }

    partsByName[fieldName] = isRaw ? rawStringToBuffer(subparts[1]) : subparts[1];
  }

  return partsByName;
}

function Boundary_parse(body) {
  var bndry = body.split('Content-Disposition: form-data;')[0];
  return bndry.trim().slice(2);
}

let AWS = require('aws-sdk')
let parser = require('http-string-parser')
let blob_util = require('blob-util')
module.exports.requestUploadUrl = (event, context, callback) => {
    if (!event || event && !event.body) {
        console.log('Error')
        return callback(null, {
            statusCode: 501,
            headers: {
                "Access-Control-Allow-Origin" : "*",
                "Access-Control-Allow-Credentials" : true
            },
            body: JSON.stringify({ "message": "Missing file" })
        })
    } else {
        let s3 = new AWS.S3()
        let params = parser.parseResponse(event.body)
        let headers = params.headers['Content-Disposition']
        let filename = headers.split("filename=\"")[headers.split("filename=\"").length-1].split("\"")[0]
        let content_type = 'image/' + filename.split('.')[filename.split('.').length-1]

        let fields, b
        try {
            b = Boundary_parse(event.body);
            fields = MultiPart_parse(event.body, 'multipart/form-body; boundary=' + b);
        } catch (err) {
            context.fail(err);
        }

        let s3Params = {
            Bucket: 'smartspark',
            Key:  'files/' + filename,
            Body: fields[filename.trim()],
            ACL: 'public-read',
            ContentType: content_type,
        }

        let uploadURL = s3.getSignedUrl('putObject', s3Params)
        s3.putObject(s3Params, function(err, data) {
            if (err) {
                console.log(err, err.stack)
                callback(null, {
                    statusCode: 512,
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({err}),
                })
            } else {
                console.log(data)
                callback(null, {
                    statusCode: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    },
                    // body: JSON.stringify({uploadURL: [uploadURL, new Blob(fields[content_type])]}),
                    body: JSON.stringify({uploadURL}),
                })
            }
        })
    }
}

module.exports.testURL = (event, context, callback) => {

}

module.exports.sendImageToS3 = (event, context, callback) => {
    event.Records.forEach(record => {
        const f = {
            name: record.s3.object.key,
            size: record.s3.object.size
        }

        console.log(`Image created: `+f.name+` (`+f.size+` bytes)`)
    })
}
