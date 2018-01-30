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

let AWS = require('aws-sdk')
let parser = require('http-string-parser')
module.exports.getUploadURL = (event, context, callback) => {
    if (!event || event && !event.body) {
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

        let s3Params = {
            Bucket: 'smartspark',
            Key:  'files/' + filename,
            Body: params.body,
            ACL: 'public-read',
            ContentType: 'image/' + filename.split('.')[filename.split('.').length-1],
            ContentEncoding: 'base64'
        }

        let uploadURL = s3.upload(s3Params)

        let put_params = {
            Bucket: 'smartspark',
            Key: 'files/' + filename,
            ACL: 'public-read',
            Body: params.body,
            ContentType: 'image/' + filename.split('.')[filename.split('.').length-1],
            ContentEncoding: 'base64'
        }

        s3.putObject(put_params, function(err, data) {
            if (err) console.log(err, err.stack)
            else console.log(data)

            callback(null, {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({'uploadURL': params}),
            })
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
